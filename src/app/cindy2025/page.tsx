'use client'

import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import styles from "./page.module.css"
import ImageGallery, { GalleryImage } from "../components/ImageGallery"
import FloatingButtons from "../components/FloatingButtons"

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

export default function Cindy2025() {
  const router = useRouter()
  // Gallery images
  const jobGalleryImages: GalleryImage[] = [
    { src: "/images/optimized/cindy2025/work0.webp", alt: "Work photo 1" },
    { src: "/images/optimized/cindy2025/work1.webp", alt: "Work photo 2" },
    { src: "/images/optimized/cindy2025/work2.webp", alt: "Work photo 3" },
    { src: "/images/optimized/cindy2025/work3.webp", alt: "Work photo 4" },
  ]
  const hobbiesGalleryImages: GalleryImage[] = [
    { src: "/images/optimized/cindy2025/ski0.webp", alt: "Ski photo 1" },
    { src: "/images/optimized/cindy2025/ski1.webp", alt: "Ski photo 2" },
    { src: "/images/optimized/cindy2025/ski2.webp", alt: "Ski photo 3" },
    { src: "/images/optimized/cindy2025/ski3.webp", alt: "Ski photo 4" },
    { src: "/images/optimized/cindy2025/ski4.webp", alt: "Ski photo 5" },
    { src: "/images/optimized/cindy2025/ski5.webp", alt: "Ski photo 6" },
    { src: "/images/optimized/cindy2025/ski6.webp", alt: "Ski photo 7" },
  ]
  const hairGalleryImages: GalleryImage[] = [
    { src: "/images/optimized/cindy2025/hair0.PNG.webp", alt: "Hair photo 1" },
    { src: "/images/optimized/cindy2025/hair1.webp", alt: "Hair photo 2" },
    { src: "/images/optimized/cindy2025/hair2.webp", alt: "Hair photo 3" },
  ]
  const peopleGalleryImages: GalleryImage[] = [
    { src: "/images/optimized/cindy2025/people0.webp", alt: "People photo 1" },
    { src: "/images/optimized/cindy2025/people1.webp", alt: "People photo 2" },
    { src: "/images/optimized/cindy2025/people2.webp", alt: "People photo 3" },
    { src: "/images/optimized/cindy2025/people3.webp", alt: "People photo 4" },
    { src: "/images/optimized/cindy2025/people4.webp", alt: "People photo 5" },
    { src: "/images/optimized/cindy2025/people5.webp", alt: "People photo 6" },
  ]
  const travelGalleryImages: GalleryImage[] = [
    { src: "/images/optimized/cindy2025/travel0.webp", alt: "Travel photo 1" },
    { src: "/images/optimized/cindy2025/travel1.webp", alt: "Travel photo 2" },
  ]
  const astronautGalleryImages: GalleryImage[] = [
    { src: "/images/optimized/cindy2025/astronaut0.webp", alt: "Astronaut photo 1" },
    { src: "/images/optimized/cindy2025/astronaut1.webp", alt: "Astronaut photo 2" },
    { src: "/images/optimized/cindy2025/astronaut2.webp", alt: "Astronaut photo 3" },
  ]
  const bonusGalleryImages: GalleryImage[] = [
    { src: "/images/optimized/cindy2025/bonus0.webp", alt: "Bonus photo 1" },
    { src: "/images/optimized/cindy2025/bonus1.webp", alt: "Bonus photo 2" },
    { src: "/images/optimized/cindy2025/bonus2.webp", alt: "Bonus photo 3" },
    { src: "/images/optimized/cindy2025/bonus3.webp", alt: "Bonus photo 4" },
    { src: "/images/optimized/cindy2025/bonus4.webp", alt: "Bonus photo 5" },
    { src: "/images/optimized/cindy2025/bonus5.webp", alt: "Bonus photo 6" },
    { src: "/images/optimized/cindy2025/bonus6.webp", alt: "Bonus photo 7" },
  ]

  return (
    <div className={styles.page}>
      <FloatingButtons 
        onCameraClick={() => router.push('/')}
        onSnowflakeClick={snowSome}
      />
      <div className={styles.container}>
        <div className={styles.contentCard}>
          <h1 className={styles.pageTitle}>Cindy&apos;s addendum: more thoughts on 2025</h1>
          <div className={styles.cardBody}>
            <p>
              &apos;Twas a busy, busy year. The highlights are much the same as last year (friends! family! travel! weddings!) and well outlined in our shared recap, so I&apos;ll try not to repeat myself too much.
            </p>
          </div>
        </div>

        <div className={styles.contentCard}>
          <h2 className={styles.cardHeading}>New this year</h2>
          <div className={styles.cardBody}>
            <h3 className={styles.cardSubheading}>My job</h3>
            <p>
              At the beginning of the year at Flex, we redesigned the whole app. It was cathartic to &quot;fix&quot; a lot of the things I&apos;d wanted to fix for a long time, and it was amazing to play such a large role in the redesign. But it also felt like the perfect closing of a chapter, and I was itching for something new. When I was leaving the office for the last time, I filled up a white bankers box and it looked like I had gotten fired (haha).
            </p>
            <p>
              I started as a Product Designer at Gusto (who makes HR/Payroll software) in July to work on their consumer banking product. It&apos;s been super exciting to work on a bigger design team at a bigger company, learning a new product space. I work Tuesdays and Wednesdays from the New York office on top of Penn Station, and visited Gusto&apos;s Denver and San Francisco offices too! The office in New York has amazing 360 degree views of the city, and I feel lucky every time I look out the windows.
            </p>
            
            {jobGalleryImages.length > 0 && (
              <div className={styles.galleryWrapper}>
                <ImageGallery images={jobGalleryImages} />
              </div>
            )}

            <h3 className={styles.cardSubheading}>Our apartment</h3>
            <p>
              You might have noticed our mailing address has changed! We moved at the end of August, right after I joined Gusto. We hosted a back-to-back double housewarming with Annie (Soups) and Zac, who just moved back to the city this fall. Here's a pic from our housewarming party:
            </p>
            
            <div className={styles.cardImages}>
              <div className={styles.cardImageWrapper}>
                <Image 
                  src="/images/optimized/cindy2025/housewarming.JPG.webp" 
                  alt="Housewarming party" 
                  fill 
                  className={styles.cardImage} 
                />
              </div>
            </div>
            
            <p>
              I&apos;ve noticed a pattern of me starting a new job and moving apartments around the same time. When I moved to the city, I worked at NextJump and lived in our Crown Heights apartment for about a year before moving and joining FactSet. I stayed there for about 2 years, then moved and joined Flex. I was ~3 years into this apartment and job in the middle of 2025! I guess I just like to shake up my life all at once when I get too comfortable.
            </p>

            <h3 className={styles.cardSubheading}>Some hobbies</h3>
            <p>
              Two activities I picked up this year: skiing and softball. It&apos;s hard picking up sports as an adult; it feels a lot harder to learn new things. But it&apos;s been a fun challenge!
            </p>
            
            {hobbiesGalleryImages.length > 0 && (
              <div className={styles.galleryWrapper}>
                <ImageGallery images={hobbiesGalleryImages} />
              </div>
            )}

            <p>
              I&apos;ve only skied about 3 times, but I was so enthused after the second time that I bought a whole outfit, ski boots, a helmet, and goggles. I am so ready for this season. Hoping I wipe out less.
            </p>
            <p>
              As for softball, our friend Ziwei recruited Ian and a few friends to join his co-ed recreational softball team. Originally I wasn&apos;t very interested, but they needed more girls on the field, so I subbed in one week. Then I was all in. I had a surprising amount of fun even though we didn&apos;t win a single game—we&apos;ve been going out to the park on Sundays to practice our swings so we&apos;re ready for next season.
            </p>

            <h3 className={styles.cardSubheading}>Hair</h3>
            <p>
              Less serious, but still important: a pretty drastic hair transformation. Bangs! New color! Annie (Soups) keeps comparing me to this meme of &quot;every asian girl ever&quot; with the bangs.
            </p>
            {hairGalleryImages.length > 0 && (
              <div className={styles.galleryWrapper}>
                <ImageGallery images={hairGalleryImages} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.contentCard}>
          <h2 className={styles.cardHeading}>Not necessarily new, but still notable</h2>
          <div className={styles.cardBody}>
        
        <h3 className={styles.cardSubheading}>Friends & family</h3>
            <p>
                It wouldn’t feel right if I didn’t give a shout out to my friends and family. A number of my college friends moved back to the city this year, and it’s been a blast having them around. And so much of my family is on the east coast that it’s as easy to see them as ever! I also managed to squeeze in two quick trips back home to Phoenix and a couple to see Ian’s family in Chicago, so this year was action-packed when it comes to seeing people I love.
            </p>

            {peopleGalleryImages.length > 0 && (
              <div className={styles.galleryWrapper}>
                <ImageGallery images={peopleGalleryImages} />
              </div>
            )}

          <h3 className={styles.cardSubheading}>Jetsetting</h3>
            <p>
              Here&apos;s a crazy Cindy travel stat: July was the only month this year I spent entirely in NYC. Every other month I was somewhere else for one reason or another! 
            </p>
            <p>
              Our international travel destinations were mostly repeat visits for me. In 2015 my high school class embarked on a London-Paris-Barcelona trip at the end of March, which was a nice parallel to our London-Paris trip at the same time this year. And I also repeat visited Taipei (I love Taiwan) after I spent a couple weeks in Taiwan with my parents last year. So Hong Kong was the only new international city I visited this year, which is pretty interesting.
            </p>
            
            {travelGalleryImages.length > 0 && (
              <div className={styles.galleryWrapper}>
                <ImageGallery images={travelGalleryImages} />
              </div>
            )}

            <p>
              There was also an extremely busy stretch of time between August and September where I was constantly on the move. We moved apartments just a couple weeks before I attended three (3) weddings in 10 days, jetting from Oregon to China to Pennsylvania. Back just in time for my birthday :)
            </p>

        <h3 className={styles.cardSubheading}>A notable outfit</h3>
            <p>
              And finally one last less serious, still notable recurring theme of the year was this astronaut outfit (and Kaylon&apos;s Patrick Bateman costume). Would you believe we got to wear these twice?
            </p>
            
            {astronautGalleryImages.length > 0 && (
              <div className={styles.galleryWrapper}>
                <ImageGallery images={astronautGalleryImages} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.contentCard}>
          <h2 className={styles.cardHeading}>In closing & next year</h2>
          <div className={styles.cardBody}>
            <p>
              All in all, I&apos;m looking back fondly on 2025 and looking forward to a number of things in 2026. I have some travel destinations in mind, some ambitious plans to do more cardio (which I say every year), and want to do more journaling. (I think penning a reflection for the past few years has helped my memory as well as my writing.) But for now—for the rest of 2025—I&apos;m going to chill out, slow down, and get some gooooood sleep. Goodnight!
            </p>
            
            <div className={styles.signatureImageWrapper}>
              <Image 
                src="/images/optimized/cindy2025/fin-cindy.JPG.webp" 
                alt="Cindy signature" 
                width={160}
                height={160}
                className={styles.signatureImage}
              />
            </div>
            
            <p className={styles.signatureText}>
              ♥️ cindy
            </p>
          </div>
        </div>

        <div className={styles.contentCard}>
          <h2 className={styles.cardHeading}>and bonus pics</h2>
          <div className={styles.cardBody}>
            {bonusGalleryImages.length > 0 ? (
              <div className={styles.galleryWrapper}>
                <ImageGallery images={bonusGalleryImages} />
              </div>
            ) : (
              <p>[gallery placeholder]</p>
            )}
          </div>
        </div>

        <div className={styles.backLink}>
          <Link href="/" className={styles.xmasLink}>
            ← Back to main page
          </Link>
        </div>
      </div>
    </div>
  )
}

