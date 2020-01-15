import React, { useState, useEffect } from 'react'
import { render } from 'react-dom'
import { getWithCors } from './util'
import './styles'
import day from 'dayjs'
import Debug from 'debug'
// import iconContact from '../assets/_ionicons_svg_md-contact.svg'
import {IoMdContact, IoMdAlert, IoMdCheckmarkCircle} from 'react-icons/io'
import {FiAlertCircle} from 'react-icons/fi'
import {CSSTransition} from 'react-transition-group'


// const debug = Debug('dchats')
const debug = window.localStorage.debug ? console.log : function (){}

function parseInitialState(data) {
  const match = /partnerStatus.*?username":"(.*?)"/.exec(data)
  debug({ match })
  if (!match) {
    throw new Error('failed to parse streamername from request')
  }

  return match[1]
}

const WS_PROXY = 'wss://ws-pass.herokuapp.com/'
// const WS_PROXY = 'ws://localhost:9000/'

async function getStreamerName(regName: string) {
  const data = await getWithCors(`https://dlive.tv/${regName}`)
  return parseInitialState(data)
}

async function openWs(regName: string, onGift: Function) {
  const streamername = await getStreamerName(regName)
  const ws = new WebSocket(
    `${WS_PROXY}wss://graphigostream.prd.dlive.tv?origin=https://dlive.tv&host=graphigostream.prd.dlive.tv`,
    'graphql-ws'
  )
  ws.onmessage = (mes) => {
    if (!mes || !mes.data) return
    const data = JSON.parse(mes.data)
    if (data.type === 'ka' || data.type === 'connection_ack') {
      return
    }
    onGift(data)
  }
  ws.onerror = console.error

  ws.onopen = function() {
    ws.send(
      JSON.stringify({
        type: 'connection_init',
        payload: {}
      })
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
      `
        }
      })
    )
  }
}

// const recentGifters = {}

// const allChats = []

function App() {
  const [error, setError] = useState<null | string>(null)
  const [loading, setLoading] = useState(true)
  const [streamer, setStreamer] = useState(
    () => window.location.hash.slice(1) || 'demo'
  )
  function storageLocation() {
    return `${streamer}-gifts`
  }
  debug({ streamer })
  const [gifts, setGifts] = useState(
    () => JSON.parse(localStorage.getItem(storageLocation())) || []
  )
  const [amountFilter, setAmountFilter] = useState(1)

  function onGift(data) {
    const giftData = data.payload.data.streamMessageReceived[0]

    if (giftData.type !== 'Gift') {
      return
    }

    debug('got gift:', giftData)

    
    // if (giftData.gift === 'LEMON' || giftData.gift === 'ICE_CREAM') {
      //   return
      // }
      const sender = giftData.sender.displayname
      const createdAt =  giftData.createdAt.slice(0, -6)
      const amount = getGiftPrice(giftData.gift, giftData.amount)
      const avatar = giftData.sender.avatar || null
      
      // recentGifters[sender] = {lastUpdated: createdAt}


    // debug(gifts)


    setGifts((prevGifts) => {
      debug(prevGifts)
      return [
        ...prevGifts,
        {
          avatar,
          createdAt,
          id: giftData.id,
          sender,
          amount,
          message: giftData.message
        },
    ]})
  }

  useEffect(() => {
    if (streamer === 'demo') return
    localStorage.setItem(storageLocation(), JSON.stringify(gifts))
  }, [gifts])
  useEffect(() => {
    window.onhashchange = function () {window.location.reload()}
    if (streamer === 'demo') {
      setInterval(() => {
        onGift(generateMockGift())
      }, 500)
      setLoading(true)
      return
    }
    openWs(streamer, onGift)
    .then(()=>{
      setLoading(false)
    })
    .catch(()=> {
      setError(`streamer not found`)
    })
  }, [])

  return (
    <div>
      <div className="superchat-container">
        {gifts.map((v) => {
          if (v.amount < amountFilter) return
          return (
            <CSSTransition appear={true} timeout={1000} classNames="fade" in={true}>

            <div className="superchat" key={v.id}>
              <div className="header">
          <div className="sender-avatar" style={{padding: 4, fontSize:30, display:'flex', alignItems: 'center'}}>
          {v.avatar ? <img width={30} height={30} src={v.avatar}/>: <IoMdContact/>}
          </div>
                <div className="sender-info">
                <strong>{v.sender}</strong>
                  <span className="money">
                  <strong>${v.amount}</strong>
                </span>
                <span className="datetime">
                  {day(+v.createdAt).format('hh:mma')}
                </span>
                </div>
              </div>
      
              <span className="message">{v.message}</span>
            </div>
            </CSSTransition>
          )
        })}
      </div>
      <div className="error-container">
        {error && <div className="error-message"><div className="error-icon"><FiAlertCircle size={24}/></div><div className="message">{error}</div></div>}
      </div>
      
      <div className="fixed-header">
        <div className="streamer-info">
          streamer:&nbsp;<strong>{streamer}</strong> {!loading && !error &&<span className="streamer-check"><IoMdCheckmarkCircle/></span>}
        </div>
        <div>

        <label>
          filter amount:&nbsp;<strong>$</strong>
        </label>
        <input
          type="number"
          max={1000}
          min={0}
          onChange={(e) => {
            setAmountFilter(+e.currentTarget.value)
          }}
          value={amountFilter}
          />
          </div>
            <button className="clear-superchats" onClick={()=>{
              window.localStorage.clear()
              window.location.reload()
            }}>clear all superchats</button>
      </div>
      <div className="clear-superchats">
      </div>
    </div>
  )
}

render(<App />, document.getElementById('app'))

const mockMessages = [
  `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
  'this is some stupid message'
]

const lemonPrice = 0.015
const prices = {
  LEMON: lemonPrice,
  ICE_CREAM: lemonPrice * 10,
  DIAMOND: lemonPrice * 100,
  NINJAGHINI: lemonPrice * 1000,
  NINJET: lemonPrice * 10000
}
function getGiftPrice(giftname: string, amount = 1) {
  return (prices[giftname] * +amount).toFixed(2)
}

function getRandomOf(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const generateMockGift = () => {
  const newGift = JSON.parse(JSON.stringify(ex2payload))
  newGift.payload.data.streamMessageReceived[0].id = (
    Math.random() * 100000
  ).toFixed(0)
  const mockUsernames = [
    'Spongebob',
    'Patrick',
    'Sandy Cheeks',
    'Eugiune Krabs',
    'Plankton',
    'Squidward'
  ]
  newGift.payload.data.streamMessageReceived[0].sender.displayname = getRandomOf(
    mockUsernames
  )
  const giftTypes = Object.keys(prices)
  newGift.payload.data.streamMessageReceived[0].gift = getRandomOf(giftTypes)
  newGift.payload.data.streamMessageReceived[0].amount = getRandomOf(
    Array(5)
      .fill('')
      .map((x, i) => i + 1)
  )

  if (Math.random() < 0.7) {
    newGift.payload.data.streamMessageReceived[0].sender.avatar = null
  }

  newGift.payload.data.streamMessageReceived[0].message = getRandomOf(
    mockMessages
  )

  return newGift
}
const ex2payload = {
  payload: {
    data: {
      streamMessageReceived: [
        {
          __typename: 'ChatGift',
          type: 'Gift',
          id: '48048c51-2f05-4124-810e-6e1765104244',
          sender: {
            __typename: 'StreamchatUser',
            id: 'streamchatuser:krozmode',
            username: 'krozmode',
            displayname: 'ZORK_MODE',
            avatar: 'https://image.dlivecdn.com/avatar/default21.png',
            partnerStatus: 'NONE',
            badges: [],
            effect: null
          },
          role: 'None',
          roomRole: 'Member',
          subscribing: false,
          createdAt: '1578979154208476310',
          gift: 'LEMON',
          amount: '1',
          recentCount: 1,
          expireDuration: 0,
          message: ''
        }
      ]
    }
  },
  id: '10',
  type: 'data'
}


// const req = {
//   "id":"2",
//   "type":"start",
//   "payload":{
//     "variables":{
//       "streamer":"theralphretort"
//     },"extensions":{
//       "persistedQuery":{
//         "version":1,"sha256Hash":"feb450b243f3dc91f7672129876b5c700b6594b9ce334bc71f574653181625d5"
//       }
//     },
//     "operationName":"StreamMessageSubscription",
//     "query":`subscription StreamMessageSubscription($streamer: String!) {
//         streamMessageReceived(streamer: $streamer) {
//           type
//           ... on ChatGift {
//             id
//             gift
//             amount
//             message
//             recentCount
//             expireDuration
//             ...VStreamChatSenderInfoFrag
//             __typename
//         }
//         ... on ChatHost {
//             id
//             viewer
//             ...VStreamChatSenderInfoFrag
//             __typename
//         }
//         ... on ChatSubscription {
//             id
//             month
//             ...VStreamChatSenderInfoFrag
//             __typename
//         }
//         ... on ChatExtendSub {
//             id
//             month
//             length
//             ...VStreamChatSenderInfoFrag
//             __typename
//         }
//         ... on ChatChangeMode {
//             mode
//             __typename
//         }
//         ... on ChatText {
//             id
//             content
//             subLength
//             ...VStreamChatSenderInfoFrag
//             __typename
//         }
//         ... on ChatSubStreak {
//             id
//             ...VStreamChatSenderInfoFrag
//             length
//             __typename
//         }
//         ... on ChatClip {
//             id
//             url
//             ...VStreamChatSenderInfoFrag
//             __typename
//         }
//         ... on ChatFollow {
//             id
//             ...VStreamChatSenderInfoFrag
//             __typename
//         }
//         ... on ChatDelete {
//             ids
//             __typename
//         }
//         ... on ChatBan {
//             id
//             ...VStreamChatSenderInfoFrag
//             bannedBy {
//               id
//               displayname
//               __typename
//           }
//           bannedByRoomRole
//           __typename
//       }
//         ... on ChatModerator {
//             id
//             ...VStreamChatSenderInfoFrag
//             add
//             __typename
//         }
//         ... on ChatEmoteAdd {
//             id
//             ...VStreamChatSenderInfoFrag
//             emote
//             __typename
//         }
//         ... on ChatTimeout {
//             id
//             ...VStreamChatSenderInfoFrag
//             minute
//             bannedBy {
//               id
//               displayname
//               __typename
//           }
//           bannedByRoomRole
//           __typename
//       }
//         ... on ChatTCValueAdd {
//             id
//             ...VStreamChatSenderInfoFrag
//             amount
//             totalAmount
//             __typename
//         }
//         ... on ChatGiftSub {
//             id
//             ...VStreamChatSenderInfoFrag
//             count
//             receiver
//             __typename
//         }
//         ... on ChatGiftSubReceive {
//             id
//             ...VStreamChatSenderInfoFrag
//             gifter
//             __typename
//         }
//         __typename
//     }
//   }
    
//     fragment VStreamChatSenderInfoFrag on SenderInfo {
//         subscribing
//         role
//         roomRole
//         sender {
//           id
//           username
//           displayname
//           avatar
//           partnerStatus
//           badges
//           effect
//           __typename
//       }
//       __typename
//   }
//     `
//   }}
