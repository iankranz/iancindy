import Image from "next/image"
import styles from "./page.module.css"

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Happy holidays From Ian & Cindy</h1>
        <Image
          src="/cindo.png"
          alt="Cindy dressed as a robber"
          width={500}
          height={726}
        />
      </main>
    </div>
  )
}
