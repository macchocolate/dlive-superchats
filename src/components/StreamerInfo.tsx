import React from 'react'
import { userByDisplayName } from '../dummy'
import { prettyNumber } from '../util'
import { IoMdCheckmarkCircle } from 'react-icons/io'
import Skeleton from '@material-ui/lab/Skeleton'

type Props = {
  streamerInfo: typeof userByDisplayName.data.userByDisplayName | null
  displayName: string
}
export default function(props: Props) {
  // <div className="grid strong center">{props.displayName}</div>
  if (!props.streamerInfo)
    return (
      <div className="grid margin center">
        <div>
          <Skeleton variant="circle" width={40} height={40} />
        </div>
        <div className="grid col">
          <Skeleton variant="text" width={100} />
          <Skeleton variant="text" width={100} />
        </div>
      </div>
    )

  return (
    <div className="grid margin center">
      <div>
        <img className="avatar-img large" src={props.streamerInfo.avatar} />
      </div>
      <div className="grid col">
        <div className="strong">
          {props.streamerInfo.displayname}
          {/* <span className="streamer-check">
            <IoMdCheckmarkCircle />
          </span> */}
        </div>
        {renderLivestreamInfo()}
      </div>
    </div>
  )

  function renderLivestreamInfo() {
    if (!props.streamerInfo?.livestream) return

    return (
      <div className="grid margin fs-12">
        <div className="grid">
          <img src="https://dlive.tv/img/live.4729dfd6.svg" />
          &nbsp;
          {prettyNumber(props.streamerInfo.livestream.watchingCount)}
        </div>
        <div className="grid">
          <img src="https://dlive.tv/img/token.f4fb1bec.svg" />
          &nbsp;
          {prettyNumber(props.streamerInfo.livestream.totalReward / 100000)}
        </div>
      </div>
    )
  }
}
