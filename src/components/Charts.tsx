import React, { useState, useMemo, ReactElement } from 'react'
import { useEffect } from 'react'
import * as d3 from 'd3'
import { Chart } from 'chart.js'
import Color from 'color'
import './charts'
import dayjs from 'dayjs'
import { prettyNumber } from '../util'

interface Props {
  name: string
  icon: ReactElement
  color: string
  units: string
  prefix?: boolean
  onFetchData: Function
}

const onFetchData = {
  // : function() {},
}
export function BarChart(props: Props) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [offset, setOffset] = useState(0)
  const [curData, setCurData] = useState(0)
  const [intervalMs, setIntervalMs] = useState(2000)
  const [increase, setIncrease] = useState(0)
  // const onFetchData = useMemo(() => props.onFetchData, [props.onFetchData])

  onFetchData[props.name] = props.onFetchData
  return (
    <div>
      <style>
        {`.anim {
  transition: all linear ${offset * 100}ms;
  transform: translateX(-${offset}px);
}`}
      </style>
      <div
        className="chart"
        style={{
          position: 'relative',
          // backgroundColor: '#333',
          // backgroundColor: '#28282f',
          backgroundColor: '#2b2b34',
          overflow: 'hidden',
          borderRadius: 6,
        }}
      >
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            top: 20,
            bottom: 0,
            left: 30,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                // color: '#777',
                // color: '#bbb',
                color: '#87878c',
                textTransform: 'uppercase',
              }}
            >
              {props.name}
            </div>
            <div
              style={{
                fontSize: 20,
                // color: '#555',
                color: '#ececed',
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {!!props.prefix && renderUnits()}
              {prettyNumber(curData)}
              {!props.prefix && renderUnits()}
              {/* {!!increase && (
                <span
                  style={{
                    // fontWeight: 600,
                    color:
                      increase >= 0 ? 'rgb(5, 177, 105)' : 'rgb(223, 95, 103)',
                    // borderRadius: 500,
                    // minWidth: 30,
                    marginBottom: 5,
                    marginLeft: 4,
                    fontSize: 14,
                  }}
                >
                  {increase >= 0 ? '+' : ''} {increase}
                </span>
              )} */}
            </div>
          </div>
          <div>
            <div
              // className="icon-circle clear"
              style={{
                // color: '#555',
                color: '#c3c3c3',
                marginRight: 30,
                fontSize: 24,
              }}
            >
              {props.icon}
            </div>
          </div>
        </div>
        <div
          style={{
            // width: 300,
            // height: 50,
            position: 'relative',
            // left: -10,
            right: -9,

            bottom: -10,
            marginLeft: -20,
            // top: 0,
            // paddingTop: 30,
            // width: '115%',
            height: '100%',
            // marginLeft: -Math.max(offset, 10),
            // marginBottom: -40,
            // left: 0,
            // top: 0,
            // height: 100,
          }}
        >
          <canvas
            // style={{ height: 50 }}
            ref={(el) => {
              if (!el || el === canvas) return
              setCanvas(el)

              let clientWidth = el.clientWidth

              const dataLength = 40
              function getRand() {
                return 0
                // return Math.round(Math.random() * 50 + 300)
              }
              let initialValues = true
              const data = Array(dataLength)
                .fill('')
                .map((x) => getRand())

              // setCanvas(el)
              const nowTime = dayjs().format('hh:mma')
              const chart = new Chart(el, {
                type: 'line',
                data: {
                  labels: data.map(() => nowTime),
                  datasets: [
                    {
                      data,

                      // label: '# of Votes',

                      // backgroundColor: 'rgba(255, 99, 132, 0.2)',
                      backgroundColor: Color(props.color)
                        .alpha(0.3)
                        .string(),
                      // 'rgba(54, 162, 235, 0.2)',
                      // 'rgba(255, 206, 86, 0.2)',
                      // 'rgba(75, 192, 192, 0.2)',
                      // 'rgba(153, 102, 255, 0.2)',
                      // 'rgba(255, 159, 64, 0.2)',

                      borderColor: props.color,
                      borderWidth: 3,
                      // pointRadius: 3,
                      pointRadius: 0,
                      pointBorderWidth: 2,
                      // pointStyle: 'line',
                      pointStyle: 'circle',
                      pointBackgroundColor: 'white',
                      // pointBackgroundColor: '#272727',
                      pointBorderColor: props.color,
                      borderCapStyle: 'round',
                      // borderJoinStyle: '',

                      // borderColor: [
                      //   'rgba(255, 99, 132, 1)',
                      //   'rgba(54, 162, 235, 1)',
                      //   'rgba(255, 206, 86, 1)',
                      //   'rgba(75, 192, 192, 1)',
                      //   'rgba(153, 102, 255, 1)',
                      //   'rgba(255, 159, 64, 1)',
                      // ],
                    },
                  ],
                },
                options: {
                  legend: {
                    display: false,
                    labels: {
                      // usePointStyle: true,
                      // boxWidth: 0,
                    },
                  },

                  // events: [],

                  layout: {
                    padding: {
                      top: 50,
                      // bottom: 10,
                    },
                  },

                  scales: {
                    xAxes: [
                      {
                        ticks: {
                          display: false,
                        },
                        gridLines: {
                          display: false,
                        },

                        // ticks: {
                        // display: false, //this will remove only the label
                        // },
                      },
                    ],
                    yAxes: [
                      {
                        ticks: {
                          display: false,
                        },
                        gridLines: {
                          display: false,
                        },
                        // bounds: [0, 100],
                        afterDataLimits(axis) {
                          axis.min = 0
                        },
                      },
                    ],
                  },
                  tooltips: {
                    intersect: false,
                    displayColors: false,
                    // caretSize: 0,
                    backgroundColor: '#2b2b34dd',
                  },
                  // tooltips: false,
                  animation: false,
                  elements: {
                    line: {
                      // tension: 0.3,
                      // tension: 0.000001,
                    },
                  },
                  plugins: {
                    filler: {
                      propagate: false,
                    },
                  },
                },
              })

              chart.canvas?.classList.add('anim')
              // chart.canvas?.classList.toggle('anim')

              // setInterval(() => {
              //   chart.canvas?.classList.remove('anim')
              //   chart.canvas?.offsetHeight
              //   // setTimeout(() => {
              //   chart.canvas?.classList.add('anim')
              //   // }, 1)
              //   // setTimeout(() => chart.canvas?.classList.remove('anim'), 499)
              // }, 500)
              setInterval(async () => {
                // // setTimeout(() => chart.canvas?.classList.toggle('anim'), 0)
                // // requestAnimationFrame(() => chart.canvas?.classList.toggle('anim'))
                const newCurData = await onFetchData[props.name]() // getRand()
                if (initialValues) {
                  initialValues = false
                  chart.data.datasets[0].data = data.fill(newCurData)
                }
                chart.canvas?.classList.remove('anim')
                clientWidth = chart.canvas?.clientWidth
                setOffset(clientWidth / dataLength)
                chart.canvas?.classList.add('anim')
                setCurData(newCurData)
                chart.data.labels.push(dayjs().format('hh:mma'))
                chart.data.labels?.shift()
                chart.data.datasets[0].data?.push(newCurData)
                const oldestData = chart.data.datasets[0].data?.shift()
                setIncrease(newCurData - oldestData)
                chart.update()
              }, intervalMs)
            }}
          />
        </div>
      </div>
    </div>
  )
  function renderUnits() {
    return (
      <span style={{ fontSize: 13, color: '#777' }}>
        &nbsp;{props.units}&nbsp;
      </span>
    )
  }
}
