import React, { useState, useEffect } from 'react'
import {
  IoMdInformationCircleOutline,
  IoMdClose,
  IoMdNotificationsOutline,
  IoMdSettings,
  IoMdArrowForward,
  IoMdArrowBack,
} from 'react-icons/io'
import _ from 'lodash'
import { EventHandler } from 'react'
import { Checkbox, Typography } from '@material-ui/core'
import { Setting } from '../index'

interface Props {
  setSettings: React.Dispatch<React.SetStateAction<Setting>>
  settings: Setting
  isOpen: boolean
  onClose: EventHandler
}
export default function(props: Props) {
  const [open, setOpen] = useState<Element | null>(null)

  const handlePopoverClick = (e: React.MouseEvent) => {
    if (open) return setOpen(null)
    setOpen(e.currentTarget)
  }

  const handlePopoverClose = () => {
    setOpen(null)
  }

  return (
    <div
      className="animate-slide panel"
      style={{
        zIndex: 100,
        width: 320,
        position: 'absolute',
        right: !!props.isOpen ? 0 : 320,
        // top: 40,
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
        // borderTopRightRadius: 15,
        height: '90vh',

        padding: 15,
        //   left: '100%',
      }}
    >
      <div className="grid" style={{ marginBottom: 10 }}>
        <div className="grid center">
          <Typography>Settings</Typography>
        </div>
        <div
          className="icon-circle btn clear light right"
          onClick={props.onClose}
        >
          <IoMdArrowBack />
        </div>
      </div>
      <div className="grid col pad">
        <div>
          <Checkbox
            checked={props.settings.filterDiamonds}
            onChange={(e) => {
              props.setSettings((prev) => ({
                ...prev,
                filterDiamonds: e.currentTarget.checked,
              }))
            }}
          />
          <label>&nbsp;Exclude diamonds</label>
        </div>
        <div>
          <Checkbox
            checked={props.settings.showDollarAmounts}
            onChange={(e) => {
              props.setSettings((prev) => ({
                ...prev,
                showDollarAmounts: e.currentTarget.checked,
              }))
            }}
          />
          <label>&nbsp;Show (rough) dollar amounts</label>
        </div>
      </div>
    </div>
  )
}
