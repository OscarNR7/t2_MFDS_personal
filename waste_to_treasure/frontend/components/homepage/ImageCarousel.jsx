'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

// Pool de imágenes más grande para la rotación
const allImagesPool = [
  'https://diaonia.com/wp-content/uploads/reciclaje-y-tratamiento-de-residuos-diversos-reciclaje-de-residuos-industriales-1024x554.jpg',
  'https://tse4.mm.bing.net/th/id/OIP.0g8kNIF2z4SyE6V3OIs2CAHaFj?cb=ucfimg2ucfimg=1&w=900&h=675&rs=1&pid=ImgDetMain&o=7&rm=3',
  'https://thumbs.dreamstime.com/z/planta-de-reciclado-residuos-industriales-con-correa-y-maquinaria-transporte-una-amplia-toma-industrial-que-exhibe-transportadora-346490838.jpg',
  'https://tse3.mm.bing.net/th/id/OIP.Ezi6rG1fj_jZFA0AbJMLcAHaET?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3',
  'https://tse4.mm.bing.net/th/id/OIP.v-L6jKG9TmVG-yKVkfyacwHaEK?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3',
  'https://www.reciclajecontemar.es/wp-content/uploads/manualidades-con-reciclado-ideas-creativas-y-sostenibles.jpg',
  'https://i.pinimg.com/originals/12/21/00/12210071b3eeb345a0f2d1886d3167be.jpg',
  'https://blog.oxfamintermon.org/wp-content/uploads/2016/06/iStock_000069933571_Small-726x483.jpg',
  'https://www.elnacional.cat/uploads/s1/42/37/11/81/decoracion-con-materiales-reciclados-1.jpeg',
  'https://i.pinimg.com/originals/b2/ca/4b/b2ca4b2165d264b76a11649d6d6e880e.jpg',
]

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Animación más lenta, cada 4 segundos
    const timer = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % allImagesPool.length)
    }, 4000) 

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full min-h-[500px] flex items-center justify-center overflow-hidden">
      {allImagesPool.map((src, index) => (
        <Image
          key={index}
          src={src}
          alt={`Foto de collage ${index + 1}`}
          width={500}
          height={500}
          className={`absolute w-[450px] h-[450px] rounded-lg object-cover transition-all duration-1000 ease-in-out rotate-3
            ${
              index === currentIndex
                ? 'opacity-100 scale-100' // Imagen visible
                : 'opacity-0 scale-95' // Imagen oculta
            }
          `}
          priority={index < 2} // Precargar las primeras imágenes
        />
      ))}
    </div>
  )
}