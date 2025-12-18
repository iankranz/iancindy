import Image from "next/image"
import styles from "./page.module.css"
import ThemeToggle from "./components/ThemeToggle"
import WindowFrame from "./components/WindowFrame"

export default function Home() {
  return (
    <div className={styles.page}>
      <ThemeToggle />
      <div className={styles.container}>
        {/* Window Frame Section */}
        <div className={styles.windowFrame}>
          {/* 1. Background - back layer */}
          <div className={styles.backgroundLayer}>
            <Image 
              src="/images/bandits-background.svg" 
              alt="" 
              fill 
              className={styles.layerImage}
              priority
            />
          </div>

          {/* 2. Window Frame - changes based on mode */}
          <WindowFrame />

          {/* 3. Kevin */}
          <div className={styles.kevinLayer}>
            <Image 
              src="/images/kevin.svg" 
              alt="Kevin" 
              fill 
              className={styles.layerImage}
            />
          </div>

          {/* Heading */}
          <h1 className={styles.heading}>Happy holidays From Ian & Cindy</h1>

          {/* Logo - positioned above tagline */}
          <div className={styles.logoLayer}>
            <Image 
              src="/images/logo.svg" 
              alt="Logo" 
              width={300}
              height={116}
              className={styles.logoImage}
            />
          </div>

          {/* Tagline */}
          <p className={styles.tagline}>A family comedy without the family.</p>
        </div>

        {/* Content Cards */}
        <div className={styles.contentCard}>
          <h2 className={styles.cardHeading}>this year&apos;s card</h2>
          <p className={styles.cardBody}>
            If you&apos;ve ever watched &quot;Home Alone,&quot; you&apos;ll immediately recognize this. If you haven&apos;t, you&apos;re probably Cindy&apos;s parents :^)
          </p>
          <div className={styles.cardImages}>
            <div className={styles.cardImageWrapper}>
              <Image src="/images/posters.png" alt="Holiday card posters" fill className={styles.cardImage} />
            </div>
          </div>
        </div>

        <div className={styles.contentCard}>
          <h2 className={styles.cardHeading}>Coming soon</h2>
          <p className={styles.cardBody}>more stuff</p>
        </div>
      </div>
    </div>
  )
}
