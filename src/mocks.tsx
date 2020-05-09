import { prices } from './consts'

const mockMessages = `The two-thirds rule in the Senate should be eliminated. It is the refuge of the
filibusterer, the obstructionist, and the devotee of minority rule, all of whom are foreign to a
true democracy. This antique restriction adds immeasurably to clumsiness and deadlock in the
treaty-ratifying process. In March, 1920 (though not in November, 1919), it was directly
responsible for the defeat of the treaty. Effective international cooperation demands a price. That price is the yielding of some
small part of our freedom of action, our sovereignty, so that we may, through preventing
international disorders, enjoy greater freedom of action. The good things of life may be free,
but peace is not one of them. One of the supreme follies of the American people in the postVersailles years was to demand rights, while shunning responsibilities. We found ourselves in
the immoral and disastrous position of seeking all the immunities, privileges, and advantages
of riding in the international boat, while refusing to pull the laboring oar of liabilities,
responsibilities, and costs. Compromise may be as essential in peace-ratifying as in peacemaking. Certainly this
was true in Washington during 1919-1920. A stubborn refusal to compromise when the
people demand compromise not only is undemocratic, but may, as it did in 1920, lead to the
defeat of the entire treaty. Sovereignty is a sacred cow tied across the path of international cooperation. It
conjures up all kinds of unwarranted fears. But an impairment of sovereignty, of national
freedom of action, is a characteristic of treaties entered into on a free and friendly basis.
Broadly speaking, a treaty is a promise to give up, in return for something else, that which we
would ordinarily do. The United States has entered into hundreds of international agreements,
but our sovereignty is essentially unimpaired. An excess of suspicions [a Yankee horse-trading trait] is a barrier to international
cooperation. Peace can be preserved only among men of good will, for it is a blessing which
rests not so much on paper pacts as on attitudes of mind. Peace can no more be maintained by
parchment than sobriety can be maintained by constitutional amendments. In 1919 we were the most powerful and secluded of the great nations, yet we acted as
though we were the weakest and most vulnerable. Rich though we were, we feared that we
might be asked to contribute one cent more than our proper share; powerful though we were,
we feared that a few thousand of our soldiers might be sent abroad to prevent ten million from
following them. We confessed by our conduct that our representatives were not intelligent
enough to sit down at the same table with those of other nations, even though we had the
highest stack of chips and most of the high cards.`
  .split('.')
  .filter((v) => Boolean(v.trim()))

const mockSenders = [
  {
    displayname: 'Patrick',
    avatar: 'https://i.imgur.com/dIX6QcT.png',
    partnerStatus: 'VERIFIED',
  },
  {
    displayname: 'Spongebob',
    avatar: 'https://i.imgur.com/0O3G4ek.png',
    partnerStatus: 'NONE',
  },
  {
    displayname: 'Mr.Krabs',
    avatar: 'https://i.imgur.com/5qV11rs.png',
  },
  {
    displayname: 'Squidward',
    avatar: 'https://i.imgur.com/wuaWw4Z.png',
  },
  { displayname: 'BoomerMan', avatar: 'https://i.imgur.com/vbNqpCk.png' },
  {
    displayname: 'Chocolate Man',
    avatar: 'https://i.imgur.com/RtoUnZG.png',
  },
  {
    displayname: 'anonymous',
    avatar: null,
  },
]

function getRandomOf(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const generateMockGift = () => {
  const newGift = JSON.parse(JSON.stringify(ex2payload))
  newGift.payload.data.streamMessageReceived[0].id = (
    Math.random() * 100000
  ).toFixed(0)

  const giftTypes = Object.keys(prices)
  newGift.payload.data.streamMessageReceived[0].gift = getRandomOf(giftTypes)

  newGift.payload.data.streamMessageReceived[0].sender = getRandomOf(
    mockSenders,
  )
  newGift.payload.data.streamMessageReceived[0].message = getRandomOf(
    mockMessages,
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
            effect: null,
          },
          role: 'None',
          roomRole: 'Member',
          subscribing: false,
          createdAt: '1578979154208476310',
          gift: 'LEMON',
          amount: '1',
          recentCount: 1,
          expireDuration: 0,
          message: '',
        },
      ],
    },
  },
  id: '10',
  type: 'data',
}

export const generateMockMessage = () => {
  const newGift = JSON.parse(JSON.stringify(ex2payload))
  newGift.payload.data.streamMessageReceived[0].id = (
    Math.random() * 100000
  ).toFixed(0)

  const giftTypes = Object.keys(prices)
  newGift.payload.data.streamMessageReceived[0].gift = getRandomOf(giftTypes)

  newGift.payload.data.streamMessageReceived[0].type = 'Message'
  newGift.payload.data.streamMessageReceived[0].sender = getRandomOf(
    mockSenders,
  )
  newGift.payload.data.streamMessageReceived[0].message = getRandomOf(
    mockMessages,
  )

  return newGift
}
