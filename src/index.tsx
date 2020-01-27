import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import day from 'dayjs'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'
import { FiAlertCircle } from 'react-icons/fi'
import {
  IoIosArrowDown,
  IoIosCash,
  IoIosPeople,
  IoMdChatboxes,
  IoMdContact,
  IoMdNotifications,
  IoMdNotificationsOutline,
  IoMdSettings,
  IoMdTrash,
} from 'react-icons/io'
import { CSSTransition } from 'react-transition-group'
import { BarChart } from './components/Charts'
import Settings from './components/Settings'
import StreamerInfo from './components/StreamerInfo'
import Tips from './components/Tips'
import { giftNames, LEMON_PRICE, prices } from './consts'
import { userByDisplayName } from './dummy'
import { generateMockGift, generateMockMessage } from './mocks'
import './styles'
import { reqWithCors } from './util'
import { WebSocketRetry } from './WebsocketRetry'
// import Debug from 'debug'

const console = window.console
const debug = window.localStorage.debug ? console.log : function() {}

function parseInitialState(data) {
  const match = /partnerStatus.*?username":"(.*?)"/.exec(data)
  debug({ match })
  if (!match) {
    throw new Error('failed to parse streamername from request')
  }

  return match[1]
}

const WS_PROXY = process.env.WS_PROXY
// const WS_PROXY = 'ws://localhost:9000/'
// const WS_PROXY2 = 'ws://localhost:9001/'

document.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    e.preventDefault()
  }
})

const tips = {
  'use-zoom': (
    <span>
      Zoom in with <kbd>ctrl</kbd> <kbd>+</kbd>
    </span>
  ),
  'demo-link': (
    <span>
      <a href="#demo">Demo page for testing new features</a>
    </span>
  ),
  'use-spacebar': (
    <span>
      Click on a chat and navigate to the next one with <kbd>spacebar</kbd>{' '}
    </span>
  ),
  'clear-chats-before-show': (
    <span>
      Before a show, click{' '}
      <em>
        <strong>clear all chats</strong>
      </em>{' '}
      <br />
      (refreshing the page will not lose any chats)
    </span>
  ),
  'debug-error': (
    <span>If something isn't working, try refreshing the page.</span>
  ),
}

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
})

export interface Setting {
  filterDiamonds: boolean
  showDollarAmounts: boolean
}

function App() {
  const [error, setError] = useState<null | string>(null)
  const [loading, setLoading] = useState(true)
  const [views, setViews] = useState(() => {
    return _.extend(
      {
        settings: false,
        notifications: false,
      },
      JSON.parse(localStorage.getItem('views') || '{}'),
    )
  })
  const [notifications, setNotifications] = useState(() => {
    const readTips = JSON.parse(localStorage.getItem('notifications') || '{}')

    return _.mapValues(tips, (val, key) => {
      return {
        message: val,
        unread: !readTips[key],
      }
    })
  })

  const [lastChatMeasure, setLastChatMeasure] = useState(new Date())
  const [totalChats, setTotalChats] = useState([0, 0, 0])

  const [displayName, setDisplayName] = useState(
    () => window.location.hash.slice(1) || 'demo',
  )
  const [streamerInfo, setStreamerInfo] = useState<
    typeof userByDisplayName.data.userByDisplayName | null
  >()
  function storageLocation() {
    return `${displayName}-gifts`
  }

  useEffect(() => {
    localStorage.setItem('views', JSON.stringify(views))
  }, [views])

  const [gifts, setGifts] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageLocation()) || '[]')
    } catch (e) {
      console.error(e)
      return []
    }
  })

  const [settings, setSettings] = useState<Setting>({
    showDollarAmounts: false,
    filterDiamonds: false,
  })

  const onGift = (data: any) => {
    const giftData = data.payload.data.streamMessageReceived[0]

    if (giftData.type === 'Message') {
      return setTotalChats((prev) => {
        return [...prev.slice(0, -1), prev[2] + 1]
      })
    }
    if (giftData.type !== 'Gift') {
      return
    }

    debug('got gift:', giftData)

    if (giftData.gift === 'LEMON' || giftData.gift === 'ICE_CREAM') {
      return
    }
    const sender = giftData.sender.displayname
    const createdAt = giftData.createdAt.slice(0, -6)
    const amount = getGiftPrice(giftData.gift, giftData.amount)
    const avatar = giftData.sender.avatar || null

    setGifts((prevGifts) => {
      debug(prevGifts)
      return [
        ...prevGifts,
        {
          avatar: avatar && '' + avatar,
          createdAt,
          id: '' + giftData.id,
          sender: '' + sender,
          gift: giftData.gift,
          amount,
          message: '' + giftData.message,
        },
      ]
    })
  }

  useEffect(() => {
    // if (streamer === 'demo') return
    localStorage.setItem(storageLocation(), JSON.stringify(gifts))
  }, [gifts])
  useEffect(() => {
    window.onhashchange = function() {
      window.location.reload()
    }

    openWs(displayName, onGift)
      .then((res) => {
        setLoading(false)
        setStreamerInfo(res?.streamerInfo.data.userByDisplayName)
      })
      .catch((e) => {
        window.console.error(e)
        setError(e.message)
      })
  }, [])

  const notificationsHasUnread = _.some(notifications, (val) => val.unread)
  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: 'flex' }}>
        {useMediaQuery(theme.breakpoints.up('lg')) && (
          <div className="fixed-header" style={{ position: 'relative' }}>
            <div
              style={{
                position: 'relative',
              }}
            >
              <Settings
                setSettings={setSettings}
                settings={settings}
                isOpen={views['settings']}
                onClose={() =>
                  setViews((prev) => ({ ...prev, settings: false }))
                }
              />
              <Tips
                isOpen={views['notifications']}
                notifications={notifications}
                setNotifications={setNotifications}
                onClose={() =>
                  setViews((prev) => ({ ...prev, notifications: false }))
                }
              />
            </div>

            <div style={{ padding: 10 }}>
              <div className="grid center" style={{ marginBottom: 10 }}>
                <StreamerInfo
                  streamerInfo={streamerInfo}
                  displayName={displayName}
                />
                <div className="grid margin right">
                  <div className="grid" style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        margin: 6,
                        display: notificationsHasUnread ? 'unset' : 'none',
                      }}
                      className={`status on pulse`}
                      // className={`status`}
                    ></div>
                    <div
                      className="icon-circle btn light fs-30"
                      onClick={() => {
                        setViews((prev) => ({ ...prev, notifications: true }))
                      }}
                    >
                      {notificationsHasUnread ? (
                        <IoMdNotifications />
                      ) : (
                        <IoMdNotificationsOutline />
                      )}
                    </div>
                  </div>
                  <div className="grid">
                    <div
                      className="icon-circle btn light fs-30"
                      onClick={() => {
                        setViews((prev) => ({ ...prev, settings: true }))
                      }}
                    >
                      <IoMdSettings />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flexDirection: 'initial' }}>
                {/* <ExpansionPanel defaultExpanded={true}>
                  <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>Settings</Typography>
                  </ExpansionPanelSummary>
                </ExpansionPanel>
              </div>

              <div style={{ flexDirection: 'column' }}>
                <ExpansionPanel>
                  <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>Tips</Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                    </div>
                  </ExpansionPanelDetails>
                </ExpansionPanel> */}
              </div>

              <div className="icon-text">
                <div
                  className="icon-circle btn"
                  onClick={() => {
                    // @ts-ignore
                    document.querySelector('.superchat:first-child').focus()
                  }}
                >
                  <IoIosArrowDown />
                </div>
                <span>Focus oldest chat</span>
              </div>
              <button
                className="clear-superchats"
                onClick={() => {
                  window.localStorage.removeItem(storageLocation())
                  setGifts([])
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      margin: '0 4px',
                    }}
                  >
                    <IoMdTrash />
                  </div>
                  <div>Clear all chats</div>
                </div>
              </button>
            </div>
          </div>
        )}
        <div className="superchat-container-wrapper">
          <div className="superchat-container">
            {gifts.map((v: any) => {
              if (settings.filterDiamonds && v.gift === 'DIAMOND') return
              return (
                <CSSTransition
                  appear={true}
                  timeout={1000}
                  classNames="fade"
                  in={true}
                  key={v.id}
                  tabIndex={1}
                  onKeyDown={(e: KeyboardEvent) => {
                    if (e.key === ' ') {
                      // @ts-ignore
                      const nextSibling = e.currentTarget.nextSibling
                      if (nextSibling && nextSibling.matches('.superchat')) {
                        nextSibling.focus()
                      } else {
                        // @ts-ignore
                        document.querySelector('.chest [tabIndex]').focus()
                      }
                      e.preventDefault()
                    }
                  }}
                >
                  <div className={`superchat ${v.gift}`}>
                    <div className="header">
                      <div
                        className="sender-avatar"
                        style={{
                          padding: 4,
                          fontSize: 30,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {v.avatar ? (
                          <img className="avatar-img" src={v.avatar} />
                        ) : (
                          <IoMdContact />
                        )}
                      </div>
                      <div className="sender-info">
                        <strong>{v.sender}</strong>
                        {renderGiftAmount(v)}
                        <span className="datetime">
                          {day(+v.createdAt).format('hh:mma')}
                        </span>
                      </div>
                    </div>

                    <span className="message">{'' + v.message}</span>
                  </div>
                </CSSTransition>
              )
            })}
            <div className="chest">
              <div tabIndex={1}>
                <img
                  src="https://dlive.tv/img/chest-close.6621d724.png"
                  width={40}
                  height={40}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            // marginTop: 10,
            paddingLeft: 10,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ width: 300, margin: 10 }}>
            <BarChart
              color="#e44"
              name="viewers"
              units=""
              icon={<IoIosPeople />}
              onFetchData={async () => {
                if (displayName === 'demo') {
                  return Math.round(Math.random() * 10)
                }
                const res = await getStreamInfo()
                return res.data.userByDisplayName.livestream.watchingCount
              }}
            />
          </div>
          <div style={{ width: 300, margin: 10 }}>
            <BarChart
              color="#44f"
              name="engagement"
              units="chats/min"
              icon={<IoMdChatboxes />}
              onFetchData={() => {
                const curTime = new Date()
                const curChatsPerSec = Math.round(
                  (totalChats[2] / (curTime - lastChatMeasure)) * 1000 * 60,
                )
                const chatsPerSec = Math.round(
                  (curChatsPerSec + totalChats[1] + totalChats[0]) / 3,
                )
                setLastChatMeasure(curTime)
                setTotalChats((prev) => [prev[0], curChatsPerSec, 0])

                return chatsPerSec
              }}
            />
          </div>
          <div style={{ width: 300, margin: 10 }}>
            <BarChart
              color="#3d3"
              name="donations"
              units="$"
              prefix={true}
              icon={<IoIosCash />}
              onFetchData={async () => {
                return Math.round(
                  _.reduce(
                    gifts,
                    (a, b) => {
                      return a + prices[b.gift] * LEMON_PRICE
                    },
                    0,
                  ),
                )
              }}
            />
          </div>
        </div>

        <div className="error-container">
          {error && (
            <div className="error-message">
              <div className="error-icon">
                <FiAlertCircle size={24} />
              </div>
              <div className="message">{error}</div>
            </div>
          )}
        </div>

        <div className="clear-superchats"></div>
      </div>
    </ThemeProvider>
  )

  function renderGiftAmount(sender: any) {
    if (settings.showDollarAmounts) {
      return (
        <span className="money">
          <strong>${sender.amount}</strong>
        </span>
      )
    }
    return (
      <span className={`money ${sender.gift}`}>
        <strong>{giftNames[sender.gift]}</strong>
      </span>
    )
  }

  async function getStreamInfo() {
    const res: typeof userByDisplayName = await reqWithCors({
      url: 'https://graphigo.prd.dlive.tv/',
      method: 'POST',
      data: {
        operationName: 'LivestreamPageRefetch',
        variables: { displayname: displayName, add: false, isLoggedIn: false },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash:
              '3945e5c49e6cf8fb5b8383a9950c5963c65be09bc97af6130c0dd6760d69f6ee',
          },
        },
      },
    })

    return res
  }
}

render(<App />, document.getElementById('app'))

async function getStreamerInfoFromDisplayName(displayName: string) {
  const res: typeof userByDisplayName = await reqWithCors({
    url: 'https://graphigo.prd.dlive.tv/',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
      // gacid: 'undefined',
      'x-dlive-mid': '18acf1cc265a1f3a5331f965339e7853',
      'x-dlive-mtype': 'web',
      'x-dlive-mversion': 'v0.5.24',
    },
    data: {
      operationName: 'LivestreamPage',
      variables: {
        displayname: displayName,
        add: false,
        isLoggedIn: false,
        isMe: false,
        showUnpicked: false,
        order: 'PickTime',
      },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash:
            '0802b3c202fe9ee4e232284b30ba0609ce6078527943944ddc370be37be8e47b',
        },
      },
    },
    method: 'POST',
  })

  return res
}

async function getStreamerName(regName: string) {
  const data = await reqWithCors(`https://dlive.tv/${regName}`)
  return parseInitialState(data)
}

async function openWs(displayName: string, onGift: Function) {
  if (displayName === 'demo') {
    let mockCount = 0

    setInterval(() => {
      if (Math.random() < 0.3) return
      onGift(generateMockMessage())
    }, 200)
    let mockInterval = setInterval(() => {
      onGift(generateMockGift())
      mockCount++
      if (mockCount > 20) {
        clearInterval(mockInterval)
      }
    }, 500)
    return {
      streamerInfo: {
        data: {
          userByDisplayName: {
            displayname: 'demo',
            avatar:
              'https://images-sihv2.prd.dlivecdn.com/fit-in/50x50/filters:quality(90)/avatar/default0.png',
          },
        },
      },
    }
  }
  const streamerInfo = await getStreamerInfoFromDisplayName(displayName)
  debug({ streamerInfo })
  const streamername = /^(user:)?(.*)/.exec(
    streamerInfo.data.userByDisplayName.username,
  )[2]

  debug({ streamername })

  // const ws = new WebSocket(
  const proxyRequestPath =
    'wss://graphigostream.prd.dlive.tv?origin=https://dlive.tv&host=graphigostream.prd.dlive.tv'
  const ws = WebSocketRetry(
    `${WS_PROXY}${proxyRequestPath}`,
    //, `${WS_PROXY2}${proxyRequestPath}`],
    'graphql-ws',
    {
      // retry: 5
    },
  )

  ws.onmessage = (mes: any) => {
    if (!mes || !mes.data) return
    const data = JSON.parse(mes.data)
    if (data.type === 'ka' || data.type === 'connection_ack') {
      return
    }
    onGift(data)
  }

  ws.onopen = function() {
    debug('onopen called')
    ws.send(
      JSON.stringify({
        type: 'connection_init',
        payload: {},
      }),
    )

    ws.send(
      JSON.stringify({
        id: '1',
        type: 'start',
        payload: {
          variables: { streamer: streamername },

          operationName: 'StreamMessageSubscription',
          query: `subscription StreamMessageSubscription($streamer: String!) {
         streamMessageReceived(streamer: $streamer) {
         type
         ... on ChatGift {
         id
         gift
         amount
         message
         recentCount
         expireDuration
         ...VStreamChatSenderInfoFrag
         __typename
     }
       __typename
     }
    }
      
      fragment VStreamChatSenderInfoFrag on SenderInfo {
         subscribing
         role
         roomRole
         sender {
         id
         username
         displayname
         avatar
         partnerStatus
         badges
         effect
         __typename
       }
       __typename
    }
      `,
        },
      }),
    )
  }

  return { streamerInfo }
}

function getGiftPrice(giftname: string, amount = 1) {
  return (prices[giftname] * LEMON_PRICE * +amount).toFixed(2)
}
