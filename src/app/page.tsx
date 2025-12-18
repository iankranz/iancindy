import Image from "next/image"
import styles from "./page.module.css"
import ThemeToggle from "./components/ThemeToggle"
import WindowFrame from "./components/WindowFrame"

export default function Home() {
  return (
    <div className={styles.page}>
      <ThemeToggle />
      <div className={styles.container}>
        <div className={styles.windowFrame}>
          <div className={styles.backgroundLayer}>
            <Image 
              src="/images/bandits-background.svg" 
              alt="" 
              fill 
              className={styles.layerImage}
              priority
            />
          </div>

          <WindowFrame />

          <div className={styles.kevinLayer}>
            <Image 
              src="/images/kevin.svg" 
              alt="Kevin" 
              fill 
              className={styles.layerImage}
            />
          </div>

          <h1 className={styles.heading}>Happy holidays From Ian & Cindy</h1>

          <div className={styles.logoLayer}>
            <Image 
              src="/images/logo.svg" 
              alt="Logo" 
              width={300}
              height={116}
              className={styles.logoImage}
            />
          </div>

          <p className={styles.tagline}>A family comedy without the family.</p>
        </div>

        <div className={styles.contentCard}>
          <h2 className={styles.cardHeading}>This Year&apos;s Card</h2>
          <div className={styles.cardBody}>
            <p>
              This year was quite a rush, and this card is no different. We&apos;re
              taking for granted that pretty much everyone we know has seen the
              movie Home Alone. We haven&apos;t really done a movie poster before, so
              we decided to go for it this year.
            </p>
            <p>
              There are a couple of posters out there for Home Alone, and we
              went with the one we liked the best for the card, but as you can
              see there&apos;s an alternate poster here on the website.
            </p>
            <p>
              Some of you fans might also know that Home Alone 2 takes place in
              New York City. Due to repeated viewings, this movie is practically
              baked into Ian&apos;s memory. That led to lots of fun jokes and just a
              general good time when doing the photo shoot for this card. We
              hope you have a wonderful holiday season and a happy new year!
            </p>
          </div>
          <div className={styles.cardImages}>
            <div className={styles.cardImageWrapper}>
              <Image src="/images/posters.png" alt="Holiday card posters" fill className={styles.cardImage} />
            </div>
          </div>
        </div>

        <div className={styles.contentCard}>
          <h2 className={styles.cardHeading}>Put Yourself in the Card!</h2>
          <div className={styles.cardBody}>
            <p>
              You might remember that we have a habit of trying to make our
              cards interactive. This year, Cindy put something fun together.
              It&apos;s a site where you can put your face into the card!
            </p>
            <a
              className={styles.xmasLink}
              href="https://faceinhole.vercel.app/"
            >
              Click here to try it out!
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
