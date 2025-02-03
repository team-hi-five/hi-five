import '../ChildCss/CardMainEmotionCard.css'
import { Card } from 'primereact/card'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { useState } from 'react'

function CardMainEmotionCard ({ id, image, name, bgColor, textColor, onClick}){
    
    const [isSelected, setIsSelected] = useState(false);

    // 더보기 클릭시 부모에게 클릭이벤트 전달 및 크기 확장
    const handleClick = () => {
        setIsSelected(true);
        onClick(id);
    }

    return(
        <motion.div className='ch-big-card-container'
                    whileHover={isSelected? {} : {y : -50,transition: {duration:0.3}}}
        >
            <div className="ch-big-card"    
                 onClick={handleClick}
            >
                <img src={image} 
                     alt={name}
                />
                <Card className="ch-big-name-card"
                      style={{ backgroundColor: bgColor }}
                >
                    <h2 className="ch-big-card-name"
                        style={{ color: textColor}}
                    >{name}</h2>
                </Card>
                <div className='card-hover-text'
                > 카드 더보기 &gt; </div>
            </div>
        </motion.div>
    )

   
}

// 타입 검증 경고메세지가 떠서 작성
CardMainEmotionCard.propTypes = {
    id:PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    bgColor: PropTypes.string.isRequired, 
    textColor: PropTypes.string.isRequired,
    onClick : PropTypes.func.isRequired,
    
}

export default CardMainEmotionCard