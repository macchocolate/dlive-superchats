export const userByDisplayName = {
  data: {
    userByDisplayName: {
      id: 'user:volitil',
      avatar:
        'https://images.prd.dlivecdn.com/avatar/99737245-0cef-11ea-bd1e-563a837bad22',
      effect: null,
      __typename: 'User',
      displayname: 'JadenMcNeil',
      partnerStatus: 'AFFILIATE',
      username: 'volitil',
      followers: {
        totalCount: 2910,
        __typename: 'UserConnection',
      },
      canSubscribe: true,
      subSetting: {
        benefits: [
          'Get an epic badge and represent the Groypers ',
          'Sub 3 months in a row and get colored text in chat',
        ],
        __typename: 'SubSetting',
      },
      livestream: {
        id: 'livestream:volitil+hHq7QmyWg',
        totalReward: '417343200',
        watchingCount: 141,
        permlink: 'volitil+hHq7QmyWg',
        title: 'Rust Time',
        content: '',
        category: {
          id: 'category:4504',
          backendID: 4504,
          title: 'Rust',
          __typename: 'Category',
          imgUrl: 'https://images.prd.dlivecdn.com/category/fze4w6j12bjw3ryjh4',
        },
        creator: {
          id: 'user:volitil',
          username: 'volitil',
          displayname: 'JadenMcNeil',
          __typename: 'User',
        },
        __typename: 'Livestream',
        language: {
          id: 'language:1',
          language: 'English',
          __typename: 'Language',
        },
        watchTime: true,
        disableAlert: true,
      },
      hostingLivestream: null,
      rerun: null,
      offlineImage:
        'https://images.prd.dlivecdn.com/offlineimage/video-placeholder.png',
      banStatus: 'NO_BAN',
      deactivated: false,
      treasureChest: {
        value: '5256231',
        state: 'COLLECTING',
        ongoingGiveaway: null,
        __typename: 'TreasureChest',
        expireAt: null,
        buffs: [],
        startGiveawayValueThreshold: '500000',
      },
      videos: {
        totalCount: 0,
        __typename: 'VideoConnection',
      },
      pastBroadcasts: {
        totalCount: 2,
        __typename: 'PastBroadcastConnection',
      },
      clips: {
        totalCount: 0,
        __typename: 'ClipConnection',
      },
      following: {
        totalCount: 23,
        __typename: 'UserConnection',
      },
      panels: [
        {
          id: 163095,
          title: 'Twitter',
          imageURL:
            'https://images.prd.dlivecdn.com/panel/da7a5e32-1015-11ea-9529-e2443572cd01',
          imageLinkURL: 'https://twitter.com/McNeilJaden',
          body: 'Check out my Twitter',
          __typename: 'Panel',
        },
        {
          id: 187002,
          title: 'Donate here',
          imageURL:
            'https://images.prd.dlivecdn.com/panel/cbea4468-2d06-11ea-bd1e-563a837bad22',
          imageLinkURL: 'https://streamlabs.com/jadenmcneil',
          body:
            'If you enjoy my stream and would like to support me, feel free to donate here:\nhttps://streamlabs.com/jadenmcneil',
          __typename: 'Panel',
        },
      ],
      beta: {
        starfruitEnabled: false,
        __typename: 'Beta',
      },
    },
  },
}
export const refreshStreamInfo = {
  operationName: 'LivestreamPageRefetch',
  variables: { displayname: 'CoachCory', add: false, isLoggedIn: false },
  extensions: {
    persistedQuery: {
      version: 1,
      sha256Hash:
        '3945e5c49e6cf8fb5b8383a9950c5963c65be09bc97af6130c0dd6760d69f6ee',
    },
  },
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
