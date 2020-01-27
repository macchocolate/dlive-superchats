import React, { useState, useEffect } from 'react'
import { Popover } from '@material-ui/core'
import {
  IoMdInformationCircleOutline,
  IoMdClose,
  IoMdAlert,
  IoMdNotificationsOutline,
  IoMdArrowBack,
  IoMdArrowForward,
} from 'react-icons/io'
import _ from 'lodash'
import { EventHandler } from 'react'

interface Props {
  notifications: any
  setNotifications: any
  isOpen: boolean
  onClose: EventHandler
}
export default function(props: Props) {
  const notifications = props.notifications

  const [open, setOpen] = useState<Element | null>(null)

  const handlePopoverClick = (e: React.MouseEvent) => {
    if (open) return setOpen(null)
    setOpen(e.currentTarget)
  }

  const handlePopoverClose = () => {
    setOpen(null)
  }

  useEffect(() => {
    localStorage.setItem(
      'notifications',
      JSON.stringify(_.mapValues(props.notifications, (val) => val.unread)),
    )
  }, [props.notifications])

  return (
    <div
      className="animate-slide panel"
      style={{
        zIndex: 100,
        width: 320,
        height: '90vh',
        position: 'absolute',
        right: !!props.isOpen ? 0 : 320,
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,

        padding: 15,
      }}
    >
      <div className="grid" style={{ marginBottom: 10 }}>
        <div className="icon-circle btn clear right" onClick={props.onClose}>
          <IoMdArrowBack />
        </div>
      </div>
      {renderTips()}
    </div>
  )

  function renderTips() {
    return _.chain(notifications)
      .map((val, key) => {
        return (
          <div
            key={key}
            className="tip"
            onClick={() => {
              props.setNotifications((prev) => ({
                ...prev,
                [key]: {
                  message: notifications[key].message,
                  unread: !notifications[key].unread,
                },
              }))
            }}
          >
            <div
              onClick={() => {}}
              className="x"
              style={{
                padding: 6,
                borderRadius: '50%',
                display: 'flex',
                marginRight: 4,
              }}
            >
              <IoMdInformationCircleOutline size={22} />
            </div>
            <div>{val.message}</div>
            <div className="icon-circle clear right">
              <div
                className={`status ${notifications[key].unread ? 'on' : 'off'}`}
                // className={`status`}
              ></div>
            </div>
          </div>
        )
      })
      .value()
  }
}
