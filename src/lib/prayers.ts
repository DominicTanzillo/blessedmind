export interface PrayerSection {
  title: string
  text: string
  type: 'opening' | 'sorrow' | 'response' | 'closing'
  /** Audio timestamp in seconds — section auto-opens when audio reaches this point */
  audioTimestamp?: number
}

export interface Prayer {
  id: string
  title: string
  shortTitle: string
  description: string
  audioFile: string | null
  audioStartSeconds: number
  starred: boolean
  sections: PrayerSection[]
}

export const PRAYERS: Prayer[] = [
  {
    id: 'seven-sorrows',
    title: 'Rosary of the Seven Sorrows of Mary',
    shortTitle: 'Seven Sorrows',
    description: 'A powerful devotion meditating on the seven sorrows experienced by the Blessed Virgin Mary.',
    audioFile: 'audio/seven-sorrows-rosary.mp3',
    audioStartSeconds: 23,
    starred: true,
    sections: [
      {
        type: 'opening',
        title: 'Sign of the Cross',
        text: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
        audioTimestamp: 23,
      },
      {
        type: 'opening',
        title: 'Act of Contrition',
        text: 'O my God, I am heartily sorry for having offended Thee, and I detest all my sins because I dread the loss of Heaven and the pains of Hell; but most of all because they offend Thee, my God, Who art all-good and deserving of all my love. I firmly resolve, with the help of Thy grace, to confess my sins, to do penance, and to amend my life. Amen.',
        audioTimestamp: 55,
      },
      {
        type: 'sorrow',
        title: 'First Sorrow: The Prophecy of Simeon',
        text: 'And Simeon blessed them, and said to Mary His Mother: "Behold, this Child is destined for the fall and for the rise of many in Israel, and for a sign that shall be contradicted. And thy own soul a sword shall pierce, that the thoughts of many hearts may be revealed." (Luke 2:34–35)\n\nLet us contemplate the grief of Mary when, at the Presentation of Jesus in the Temple, holy Simeon announced that a sword of sorrow would pierce her soul.',
        audioTimestamp: 118,
      },
      {
        type: 'response',
        title: 'Seven Hail Marys',
        text: 'Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.\n\n(Repeat 7 times)',
        audioTimestamp: 142,
      },
      {
        type: 'sorrow',
        title: 'Second Sorrow: The Flight into Egypt',
        text: 'An angel of the Lord appeared in a dream to Joseph, saying: "Arise, and take the Child and His Mother, and fly into Egypt, and remain there until I tell thee. For Herod will seek the Child to destroy Him." (Matthew 2:13–14)\n\nLet us contemplate the grief of Mary when she fled into Egypt with Saint Joseph and the Infant Jesus, in danger and hardship.',
        audioTimestamp: 248,
      },
      {
        type: 'response',
        title: 'Seven Hail Marys',
        text: 'Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.\n\n(Repeat 7 times)',
        audioTimestamp: 286,
      },
      {
        type: 'sorrow',
        title: 'Third Sorrow: The Loss of Jesus in the Temple',
        text: 'And not finding Him, they returned to Jerusalem, seeking Him. And it came to pass that after three days they found Him in the Temple, sitting in the midst of the teachers, hearing them and asking them questions. (Luke 2:45–46)\n\nLet us contemplate the grief of Mary when she lost her beloved Son in Jerusalem for three days and sought Him sorrowing.',
        audioTimestamp: 396,
      },
      {
        type: 'response',
        title: 'Seven Hail Marys',
        text: 'Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.\n\n(Repeat 7 times)',
        audioTimestamp: 420,
      },
      {
        type: 'sorrow',
        title: 'Fourth Sorrow: Mary Meets Jesus on the Way to Calvary',
        text: 'And there followed Him a great multitude of people, and of women, who bewailed and lamented Him. But Jesus turning to them said: "Daughters of Jerusalem, weep not for Me, but weep for yourselves and for your children." (Luke 23:27–28)\n\nLet us contemplate the grief of Mary when she met her Son, all bruised and bleeding, carrying His Cross to Calvary.',
        audioTimestamp: 535,
      },
      {
        type: 'response',
        title: 'Seven Hail Marys',
        text: 'Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.\n\n(Repeat 7 times)',
        audioTimestamp: 561,
      },
      {
        type: 'sorrow',
        title: 'Fifth Sorrow: The Crucifixion and Death of Jesus',
        text: 'Now there stood by the Cross of Jesus, His Mother. When Jesus therefore saw His Mother and the disciple whom He loved standing by, He said to His Mother: "Woman, behold thy son." Then He said to the disciple: "Behold thy Mother." (John 19:25–27)\n\nLet us contemplate the grief of Mary as she stood at the foot of the Cross and watched her beloved Son die in agony.',
        audioTimestamp: 656,
      },
      {
        type: 'response',
        title: 'Seven Hail Marys',
        text: 'Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.\n\n(Repeat 7 times)',
        audioTimestamp: 682,
      },
      {
        type: 'sorrow',
        title: 'Sixth Sorrow: Jesus is Taken Down from the Cross',
        text: 'Joseph of Arimathea, a noble counsellor, came and went in boldly to Pilate and begged the body of Jesus. And he bought fine linen, and taking Him down, wrapped Him in the fine linen. (Mark 15:43–46)\n\nLet us contemplate the grief of Mary when the lifeless body of her Son was taken down from the Cross and placed in her arms.',
        audioTimestamp: 799,
      },
      {
        type: 'response',
        title: 'Seven Hail Marys',
        text: 'Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.\n\n(Repeat 7 times)',
        audioTimestamp: 817,
      },
      {
        type: 'sorrow',
        title: 'Seventh Sorrow: Jesus is Laid in the Tomb',
        text: 'And Joseph taking the body, wrapped it up in a clean linen cloth, and laid it in his own new monument, which he had hewn out in a rock. And he rolled a great stone to the door of the monument. (Matthew 27:59–60)\n\nLet us contemplate the grief of Mary when the body of her Son was laid in the tomb and she was left alone in her sorrow.',
        audioTimestamp: 938,
      },
      {
        type: 'response',
        title: 'Seven Hail Marys',
        text: 'Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.\n\n(Repeat 7 times)',
        audioTimestamp: 954,
      },
      {
        type: 'closing',
        title: 'Three Hail Marys',
        text: 'In honor of the tears shed by our Sorrowful Mother:\n\nHail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.\n\n(Repeat 3 times)',
        audioTimestamp: 1071,
      },
      {
        type: 'closing',
        title: 'Closing Prayer',
        text: 'Queen of Martyrs, thy heart suffered so much. I beg thee, by the merits of the tears thou shed in these terrible and eternally memorable occasions, to obtain for me and all the sinners of the world the grace of complete sincerity and repentance. Amen.\n\nMost Blessed Virgin Mary, by the anguish and sorrow of thy Immaculate Heart, may we be granted the graces we implore. Mother of the Word Incarnate, despise not our petitions, but in thy mercy hear and answer us. Amen.',
        audioTimestamp: 1117,
      },
    ],
  },
]
