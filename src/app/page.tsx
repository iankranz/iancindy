import Image from "next/image"
import styles from "./page.module.css"

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.content}>
          {/* <Image
            src="/light.png"
            alt="Ian and Cindy in the Home Alone poster"
            fill={true}
            className={styles.mainImage}
          /> */}
          <img
            src="/light.png"
            alt="Ian and Cindy in the Home Alone poster"
            className={styles.mainImage}
          />
          <div className={styles.surface}>
            <div className={styles["surface-heading"]}>
              This Year&apos;s Card
            </div>
            <div>
              This year was quite a rush, and this card is no different. We’re
              taking for granted that pretty much everyone we know has seen the
              movie Home Alone. We haven’t really done a movie poster before, so
              we decided to go for it this year.
            </div>
            <div>
              There are a couple of posters out there for Home Alone, and we
              went with the one we liked the best for the card, but as you can
              see there’s an alternate poster here on the website.{" "}
            </div>
            <div>
              Some of you fans might also know that Home Alone 2 takes place in
              New York City. Due to repeated viewings, this movie is practically
              baked into Ian’s memory. That led to lots of fun jokes and just a
              general good time when doing the photo shoot for this card. We
              hope you have a wonderful holiday season and a happy new year!
            </div>
          </div>
          <div className={styles.surface}>
            <div className={styles["surface-heading"]}>
              Put Yourself in the Card!
            </div>
            <div>
              You might remember that we have a habit of trying to make our
              cards interactive. This year, Cindy put something fun together.
              It&apos;s a site where you can put your face into the card!
            </div>
            <a
              className={styles["xmas-link"]}
              href="https://faceinhole.vercel.app/"
            >
              Click here to try it out!
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
