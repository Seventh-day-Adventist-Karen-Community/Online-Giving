import React from 'react'
import { MessageType } from './types'
import ToastItem from './toastItem'
import { AnimatePresence } from "framer-motion";
const Toast = ({messages, position}:{messages:MessageType[], position?:string}) => {
    // console.log(messages)
  return (
    
    <div style={{zIndex:99999999}} className={`fixed z-50 gap-2 flex flex-col px-4 max-h-fit 
    ${position == 'top-left'?
      ' md:left-6 md:top-8 top-10 md:ml-4'
    :
    position == 'top-center'?
      ' w-full items-center md:top-8 top-10 md:m-0 '
    :
    position == 'top-right'?
      ' md:right-6 md:top-8 top-10 md:mr-4 '
    :
    position == 'bottom-left'?
      ' md:left-6 md:bottom-6 bottom-8 md:ml-4 '
    :
    position == 'bottom-center'?
      ' w-full items-center md:bottom-6 bottom-8 md:m-0 '
    :
    position == 'bottom-right'?
      ' md:right-6 md:bottom-6 bottom-8 md:ml-4 '
    :
      ' w-full items-center md:top-8 top-10 '
  }
    `}>
      <AnimatePresence>
          {messages.map(message=>{
            return(
              <ToastItem key={message.index} message={message.message} type={message.type} position={position} />
                    )
                  })
                }
      </AnimatePresence>
    </div>
  )
}

export default Toast
