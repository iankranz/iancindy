'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import styles from "./page.module.css"
import WindowFrame from "./components/WindowFrame"
import FaceInHoleModal from "./components/FaceInHoleModal"
import FloatingButtons from "./components/FloatingButtons"
import ImageGallery, { GalleryImage } from "./components/ImageGallery"
import CountUpStat from "./components/CountUpStat"

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

  // Example gallery images - replace with your actual images from Figma
  // You can add multiple galleries by creating different arrays
  // Gallery for "About the card" section - 2 images
  const moviePosterImages: GalleryImage[] = [
    // Add your 2 gallery images here from Figma
    // { src: "/images/poster-1.jpg", alt: "Home Alone poster 1" },
    // { src: "/images/poster-2.jpg", alt: "Home Alone poster 2" },
  ]

  // Galleries for "Recapping our 2025" section
  const travelGalleryImages: GalleryImage[] = [
    // Add travel gallery images here
  ]

  const weddingsGalleryImages: GalleryImage[] = [
    // Add weddings & family gallery images here
  ]

  const movingGalleryImages: GalleryImage[] = [
    // Add moving gallery images here
  ]

  const bonusGalleryImages: GalleryImage[] = [
    // Add moving gallery images here
  ]

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
          <h2 className={styles.cardHeading}>Hello and welcome!</h2>
          <div className={styles.cardBody}>
            <p>
              Hope your holiday season is going well. To kick things off, you might remember that we have a habit of trying to make our cards interactive. This year, you can be part of the card. Ever wonder what it&apos;s like to be Kevin McCallister? Snap a pic and send us the result! :)
            </p>
            <button
              className={styles.btnPrimary}
              onClick={() => setIsModalOpen(true)}
            >
              Be part of the card
            </button>
          </div>
        </div>

        <div className={styles.contentCard}>
          <h2 className={styles.cardHeading}>About the card</h2>
          <div className={styles.cardBody}>
            <p>
              This year was quite a rush, and this card is no different. A few outfit tests and a speedy photoshoot later, we&apos;ve become the Home Alone villains, the Wet Bandits. We put the movie on the TV, enlisted our friend Robert to help us snap some pics, and voila!
            </p>
            <p>
              (We&apos;re basically taking for granted that pretty much everyone has seen this movie. Due to repeated viewings, this movie is practically baked into Ian&apos;s memory. But if you&apos;re not as familiar, when Kevin, the kid pictured above, is accidentally left behind while his family goes on vacation, he&apos;s left to his own devices to prevent us from robbing his house.)
            </p>

          <div className={styles.cardImages}>
            <div className={styles.cardImageWrapper}>
              <Image src="/images/posters.png" alt="Home Alone movie posters" fill className={styles.cardImage} />
            </div>
          </div>

          {/* Image Gallery - replace moviePosterImages with your actual images */}
          {moviePosterImages.length > 0 && (
            <div className={styles.galleryWrapper}>
              <ImageGallery images={moviePosterImages} />
            </div>
          )}

            <p>
              Some of you fans might also know that Home Alone 2 takes place in New York City. We know, we know. We live in NYC, we should have done Home Alone 2... but you&apos;ll just have to wait for the sequel.
            </p>
            
          </div>
        </div>

        <div className={styles.contentCard}>
          <h2 className={styles.cardHeading}>Recapping our 2025</h2>
          <div className={styles.cardBody}>
            <p>
              The year 2025 is reaching its conclusion, and many people (you included) are wondering what the year held for Ian and Cindy. You&apos;ve come to the right place. Buckle up, and let us take you on a brief sleigh ride through our year, and let our annual highlights be your warm hearth on this cold winter night.
            </p>
            
            <h3 className={styles.cardSubheading}>First up: travel</h3>
            <p>
              Cindy and Ian covered more distance this year than any other before. We visited some awesome places, and some pretty decent airport lounges.
            </p>
            <p>
              Between the two of us we went to...
            </p>
            
            <div className={styles.statsGrid}>
              <CountUpStat value="20+" label="cities/towns" />
              <CountUpStat value="8" label="US states" />
              <CountUpStat value="5" label="countries" />
              <CountUpStat value="3" label="continents" />
            </div>

            <p>
              We had a lot of firsts this year. It was Ian&apos;s first time visiting Europe and Asia. Cindy tried skiing for the first time and got to experience some sick slopes in Vermont.
            </p>

            {/* Travel Gallery - replace with your actual images */}
            {travelGalleryImages.length > 0 && (
              <div className={styles.galleryWrapper}>
                <ImageGallery images={travelGalleryImages} />
              </div>
            )}

            <p>
              We also traveled a decent amount for weddings &amp; family. We&apos;re getting to the age where our friends are getting married left and right. This year, our friends&apos; weddings brought us to Oregon, Long Island, and Pennsylvania. And Cindy traveled to her mom&apos;s hometown of Taiyuan in China for her cousin&apos;s wedding!
            </p>

            <div className={styles.statsGrid}>
              <CountUpStat value="4" label="weddings attended" />
              <CountUpStat value="5" label="times Ian was in chicago" />
              <CountUpStat value="6" label="cities Cindy saw her family in" />
            </div>

            {/* Weddings Gallery - replace with your actual images */}
            {weddingsGalleryImages.length > 0 && (
              <div className={styles.galleryWrapper}>
                <ImageGallery images={weddingsGalleryImages} />
              </div>
            )}

            <h3 className={styles.cardSubheading}>Big moves</h3>
            <p>
              We moved apartments this year! Our new place is about three quarters of a mile south of our last one. Technically it&apos;s a different neighborhood—we went from Greenpoint to Williamsburg.
            </p>
            <p>
              The move went (mostly) smoothly; we hired movers for most of our stuff and carted the rest in a wagon door-to-door.
            </p>

            {/* Moving Gallery - replace with your actual images */}
            {movingGalleryImages.length > 0 && (
              <div className={styles.galleryWrapper}>
                <ImageGallery images={movingGalleryImages} />
              </div>
            )}

            <p>
              Our new place is definitely an upgrade. Great natural light, a few new building amenities, and more space. Come visit and check it out!
            </p>

            <h3 className={styles.cardSubheading}>Life at home</h3>
            <p>
              In between traveling and moving, we still managed to take advantage of many things the city has to offer.
            </p>
            <p>
              We&apos;re lucky to have so many friends nearby (and visiting). A lot of our weekends and nights were spent exploring the local cuisine, going to concerts and shows, and at many a party.
            </p>
            <p>
              For sport, we began playing softball in a rec league. Our team hasn&apos;t won anything yet, but next season it&apos;ll be totally different, we swear.
            </p>

            <h3 className={styles.cardSubheading}>Fin</h3>
            <p>
              We&apos;re enjoying the company of Ian&apos;s family and the calm of the Chicago suburbs before 2026 officially gets moving. Thank you for reading, and we hope your holidays are swell! Goodbye 2025!
            </p>

            {/* Bonus Gallery - replace with your actual images */}
            {bonusGalleryImages.length > 0 && (
              <div className={styles.galleryWrapper}>
                <ImageGallery images={bonusGalleryImages} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.contentCard}>
          <h2 className={styles.cardHeading}>More content</h2>
          <div className={styles.cardBody}>
            <p>
              Coming soon: Cindy&apos;s addendum to the above
              {/* <a href="#" className={styles.xmasLink}>Coming soon: Cindy&apos;s 2025 thoughts</a> */}
            </p>
            <p>
              <a href="https://substack.com/@iankranz" className={styles.xmasLink}>Ian&apos;s newsletter</a>
            </p>
            <h3 className={styles.cardSubheading}>Revisit our past cards</h3>
            <p>
              <a href="https://592manhattan.com/" className={styles.xmasLink}>2024&apos;s card</a>
            </p>
            <p>
              <a href="https://592manhattan.com/holiday2023" className={styles.xmasLink}>2023&apos;s card</a>
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
