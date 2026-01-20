import React from 'react'
import { ImageWithFallback } from '../image/ImageWithFallback'

type PropType = {
  selected: boolean
  index: number
  onClick: () => void
  url: string // Добавляем новое свойство
}

export const Thumb: React.FC<PropType> = (props) => {
  const { selected, index, onClick, url } = props

   return (
    <div
      className={'embla-thumbs__slide'.concat(
        selected ? ' embla-thumbs__slide--selected' : ''
      )}
    >
      {/* <button
        onClick={onClick}
        type="button"
        className="embla-thumbs__slide__button"
      > */}
        <ImageWithFallback
         onClick={onClick}
          className="embla-thumbs__slide__number"
          style={{
            width:"100%", 
            height: "100%",
            objectFit: "cover",
            fontSize: "10px",
            color: "#ccc",
            backgroundColor: "#f5f5f5"
          }}
          src={url}
          alt=""
        />
      {/* </button> */}
    </div>
  )
}