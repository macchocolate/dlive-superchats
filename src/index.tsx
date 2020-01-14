import React, { useState, useEffect } from "react"
import { render } from "react-dom"
import { getWithCors } from "./util"
import "./styles"
import day from "dayjs"
import Debug from 'debug'

const debug = Debug('dchats')

function parseInitialState(data) {
  const match = /partnerStatus.*?username":"(.*?)"/.exec(data)
  debug({ match })
  if (!match) {
    throw new Error("failed to parse streamername from request")
  }

  return match[1]
}

const WS_PROXY = "ws://ws-pass.herokuapp.com/"
// const WS_PROXY = 'ws://localhost:9000/'

async function getStreamerName(regName: string) {
  const data = await getWithCors(`https://dlive.tv/${regName}`)
  return parseInitialState(data)
}

async function openWs(regName: string, onGift: Function) {
  const streamername = await getStreamerName(regName)
  const ws = new WebSocket(
    `${WS_PROXY}wss://graphigostream.prd.dlive.tv?origin=https://dlive.tv&host=graphigostream.prd.dlive.tv`,
    "graphql-ws"
  )
  ws.onmessage = (mes) => {
    if (!mes || !mes.data) return
    const data = JSON.parse(mes.data)
    if (data.type === "ka" || data.type === "connection_ack") {
      return
    }
    onGift(data)
  }
  ws.onerror = console.error

  ws.onopen = function() {
    ws.send(
      JSON.stringify({
        type: "connection_init",
        payload: {}
      })
    )

    ws.send(
      JSON.stringify({
        id: "1",
        type: "start",
        payload: {
          variables: { streamer: streamername },

          operationName: "StreamMessageSubscription",
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

function App() {
  const [streamer, setStreamer] = useState(
    () => window.location.hash.slice(1) || "shalit"
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
    debug("got gift:", giftData)
    if (giftData.type !== "Gift") {
      return
    }

    if (giftData.gift === "LEMON" || giftData.gift === "ICE_CREAM") {
      return
    }
    const amount = getGiftPrice(giftData.gift, giftData.amount)

    setGifts((prevGifts) => [
      {
        createdAt: giftData.createdAt,
        id: giftData.id,
        sender: giftData.sender.displayname,
        amount,
        message: giftData.message
      },
      ...prevGifts
    ])
  }

  useEffect(() => {
    localStorage.setItem(storageLocation(), JSON.stringify(gifts))
  }, [gifts])
  useEffect(() => {
    if (debug.enabled) {
      setInterval(() => {
        onGift(generateMockGift())
      }, 500)
      return
    }
    openWs(streamer, onGift)
  }, [])

  return (
    <div>
      <div className="superchat-container">
        {gifts.map((v) => {
          if (v.amount < amountFilter) return
          return (
            <div className="superchat" key={v.id}>
              <div>
                <strong>{v.sender}</strong>
                <span className="money">
                  <strong>${v.amount}</strong>
                </span>
                <span className="datetime">
                  {day(+v.createdAt.slice(0, -6)).format("hh:mma")}
                </span>
              </div>
              <span className="message">{v.message}</span>
            </div>
          )
        })}
      </div>
      <div className="amount-filter">
        <div>
          streamer: <strong>{streamer}</strong>
        </div>
        <label>
          filter amount:&nbsp; <strong>$</strong>
        </label>
        <input
          type="number"
          max={1000}
          min={1}
          onChange={(e) => {
            setAmountFilter(+e.currentTarget.value)
          }}
          value={amountFilter}
        />
      </div>
    </div>
  )
}

render(<App />, document.getElementById("app"))

const mockMessages = [
  `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
  "this is some stupid message"
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
    "Spongebob",
    "Patrick",
    "Sandy Cheeks",
    "Eugiune Krabs",
    "Plankton",
    "Squidward"
  ]
  newGift.payload.data.streamMessageReceived[0].sender.displayname = getRandomOf(
    mockUsernames
  )
  const giftTypes = Object.keys(prices)
  newGift.payload.data.streamMessageReceived[0].gift = getRandomOf(giftTypes)
  newGift.payload.data.streamMessageReceived[0].amount = getRandomOf(
    Array(5)
      .fill("")
      .map((x, i) => i + 1)
  )

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
          __typename: "ChatGift",
          type: "Gift",
          id: "48048c51-2f05-4124-810e-6e1765104244",
          sender: {
            __typename: "StreamchatUser",
            id: "streamchatuser:krozmode",
            username: "krozmode",
            displayname: "ZORK_MODE",
            avatar: "https://image.dlivecdn.com/avatar/default21.png",
            partnerStatus: "NONE",
            badges: [],
            effect: null
          },
          role: "None",
          roomRole: "Member",
          subscribing: false,
          createdAt: "1578979154208476310",
          gift: "LEMON",
          amount: "1",
          recentCount: 1,
          expireDuration: 0,
          message: ""
        }
      ]
    }
  },
  id: "10",
  type: "data"
}
