'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import styles from "./page.module.css"
import WindowFrame from "./components/WindowFrame"
import FaceInHoleModal from "./components/FaceInHoleModal"
import FloatingButtons from "./components/FloatingButtons"

declare global {
  interface Window {
    confetti: (options: any) => void
  }
}

function snowSome() {
  if (typeof window !== 'undefined' && window.confetti) {
    window.confetti({
      angle: 270,
      colors: ["#ffffff"],
      drift: 0.3,
      flat: true,
      gravity: 0.5,
      origin: { x: 0.4, y: -0.2 },
      scalar: 0.6,
      shapes: ["circle"],
      spread: 180,
      startVelocity: 25,
      ticks: 600
    })
  }
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [kevinCompositeUrl, setKevinCompositeUrl] = useState<string | null>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleReplaceKevin = (url: string) => {
    setKevinCompositeUrl(url)
  }

  const parallaxSpeed = {
    background: -0.05,
    windowFrame: 0,
    kevin: 0.02,
    heading: 0.5,
    logo: 0,
    tagline: 0.01,
  }

  return (
    <div className={styles.page}>
      <FloatingButtons 
        onCameraClick={() => setIsModalOpen(true)}
        onSnowflakeClick={snowSome}
      />
      <div className={styles.container}>
        <div className={styles.windowFrame}>
          <div 
            className={styles.backgroundLayer}
            style={{
              transform: `translateY(${scrollY * parallaxSpeed.background}px)`,
            }}
          >
            <Image 
              src="/images/bandits-background.svg" 
              alt="Cindy and Ian as the Wet Bandits, peering through the window" 
              fill 
              className={styles.layerImage}
              priority
            />
          </div>

          <WindowFrame scrollY={scrollY * parallaxSpeed.windowFrame} />

          <div 
            className={styles.kevinLayer}
            style={{
              transform: `translateY(${scrollY * parallaxSpeed.kevin}px)`,
            }}
          >
            {kevinCompositeUrl ? (
              <img
                src={kevinCompositeUrl}
                alt="Your face"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                }}
              />
            ) : (
              <Image 
                src="/images/kevin.svg" 
                alt="Kevin" 
                fill 
                className={styles.layerImage}
              />
            )}
          </div>

          <h1 
            className={styles.heading}
            style={{
              transform: `translateY(${scrollY * parallaxSpeed.heading}px)`,
            }}
          >
            Happy holidays From Ian & Cindy
          </h1>

          <div 
            className={styles.logoLayer}
            style={{
              transform: `translateX(-50%) translateY(${scrollY * parallaxSpeed.logo}px)`,
            }}
          >
            <Image 
              src="/images/logo.svg" 
              alt="Home Alone movie logo" 
              width={300}
              height={116}
              className={styles.logoImage}
            />
          </div>

          <p 
            className={styles.tagline}
            style={{
              transform: `translateY(${scrollY * parallaxSpeed.tagline}px)`,
            }}
          >
            A family comedy without the family.
          </p>
        </div>

        <div className={styles.contentCard}>
          <h2 className={styles.cardHeading}>Ever wonder what it&apos;s like to be Kevin McCallister?</h2>
          <div className={styles.cardBody}>
            <p>
              You might remember that we have a habit of trying to make our
              cards interactive. This year, Cindy put something fun together.
              Snap a pic and become part of the card!
            </p>
            <button
              className={styles.btnPrimary}
              onClick={() => setIsModalOpen(true)}
            >
              try it out
            </button>
          </div>
        </div>

        <div className={styles.contentCard}>
          <h2 className={styles.cardHeading}>About the card</h2>
          <div className={styles.cardBody}>
            <p>
              This year was quite a rush, and this card is no different. A few outfit tests and a speedy photoshoot later, we&apos;ve become Home Alone. We put the movie on the TV, enlisted our friend Robert to help us snap some pics, and voila! We&apos;ve cast ourselves as the villains of the movie, the Wet Bandits.
            </p>
            <p>
              (We&apos;re basically taking for granted that pretty much everyone we know has seen this movie. But if you&apos;re not familiar (we don&apos;t judge),  When Kevin, the kid pictured above, is accidentally left behind while his family goes on vacation, he&apos; left to his own devices to prevent us from robbing his house.)
            </p>
            <p>
              There are a couple of posters out there for Home Alone, and we
              went with the one we liked the best for the card, but as you can
              see there&apos;s an alternate poster here on the website.
            </p>

          <div className={styles.cardImages}>
            <div className={styles.cardImageWrapper}>
              <Image src="/images/posters.png" alt="Home Alone movie posters" fill className={styles.cardImage} />
            </div>
          </div>
            <p>
              Some of you fans might also know that Home Alone 2 takes place in
              New York City. Due to repeated viewings, this movie is practically
              baked into Ian&apos;s memory. We know, we know. We live in New York, we should have done Home Alone 2... but you&apos;ll just have to wait for the sequel.
            </p>
            
          </div>
        </div>

        <div className={styles.contentCard}>
          <h2 className={styles.cardHeading}>Coming soon</h2>
          <div className={styles.cardBody}>
            <p>
              If you&apos;re looking for reflections and our recap of the year, you&apos;re too early! We&apos;re still compiling and reflecting on the year—catch up with us in a few days :) 
            </p>
            <p>In the meantime, there are still a few things to explore on the site. And if you don&apos;t come back by the end of the year, we hope you have a wonderful holiday season and a happy new year!
            </p>
          </div>
        </div>

        <p>
              (merry christmas, ya filthy animals!)
            </p>
          <p>
              ♥️ cindy & ian, 2025
            </p>
      </div>
      <FaceInHoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReplaceKevin={handleReplaceKevin}
      />
    </div>
  )
}
