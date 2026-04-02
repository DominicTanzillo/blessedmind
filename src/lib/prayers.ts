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
  // ── Micro-Anchor Prayers (gap-fillers, no timer needed) ──────
  {
    id: 'i-am-loved',
    title: 'I Am Loved — A Prayer Against Shame',
    shortTitle: 'I Am Loved',
    description: 'When shame or unworthiness creeps in. Thirty seconds to ground yourself.',
    audioFile: null,
    audioStartSeconds: 0,
    starred: false,
    sections: [
      {
        type: 'opening',
        title: 'Ground Yourself',
        text: 'Place your hand on your heart. Breathe slowly. You are here. You are alive. That is not an accident.',
      },
      {
        type: 'sorrow',
        title: 'The Truth',
        text: '"See what love the Father has given us, that we should be called children of God; and so we are."\n— 1 John 3:1\n\nYou are not what you did. You are not what was done to you. You are loved — not because you earned it, but because He chose it before you drew breath.',
      },
      {
        type: 'closing',
        title: 'Anchor',
        text: 'Say aloud or in your heart:\n\n"I am loved. I am His. Nothing can separate me from that love."\n\n"For I am convinced that neither death nor life, neither angels nor rulers, neither things present nor things to come, nor powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God."\n— Romans 8:38–39',
      },
    ],
  },
  {
    id: 'coram-deo',
    title: 'Coram Deo — Before the Face of God',
    shortTitle: 'Coram Deo',
    description: 'He is present. Not as judge, as friend. Ten seconds to reorient.',
    audioFile: null,
    audioStartSeconds: 0,
    starred: false,
    sections: [
      {
        type: 'opening',
        title: 'Presence',
        text: 'Coram Deo.\n\nBefore the face of God.\n\nHe is here — not watching from a distance, not tallying failures. Here. Present. Witnessing this moment with you.',
      },
      {
        type: 'closing',
        title: 'Reorient',
        text: '"Where shall I go from your Spirit? Or where shall I flee from your presence? If I ascend to heaven, you are there. If I make my bed in Sheol, you are there."\n— Psalm 139:7–8\n\nYou are seen. You are known. You are not alone.\n\nReturn to what is before you.',
      },
    ],
  },
  {
    id: 'sacrifice-principle',
    title: 'The Sacrifice Principle — Fr. Pius',
    shortTitle: 'Sacrifice Principle',
    description: 'Speak this when avoiding something that matters.',
    audioFile: null,
    audioStartSeconds: 0,
    starred: false,
    sections: [
      {
        type: 'opening',
        title: 'The Principle',
        text: '"If you won\'t sacrifice for what you want, what you want becomes the sacrifice."\n— Fr. Pius',
      },
      {
        type: 'sorrow',
        title: 'Examine',
        text: 'What are you avoiding right now?\n\nName it. Say it plainly.\n\nThe avoidance feels like rest, but it is quietly costing you the thing you say you care about. Every hour of delay is a small offering — laid on the wrong altar.',
      },
      {
        type: 'closing',
        title: 'Resolve',
        text: '"No one who puts his hand to the plow and looks back is fit for the kingdom of God."\n— Luke 9:62\n\nLord, give me the grace to choose the harder right over the easier wrong. Not tomorrow. Now.\n\nAmen.',
      },
    ],
  },
  {
    id: 'umbrellino-technology',
    title: 'Umbrellino — Prayer Before the Screen',
    shortTitle: 'Umbrellino',
    description: 'Before opening a screen for work. Conscious choice, not autopilot.',
    audioFile: null,
    audioStartSeconds: 0,
    starred: false,
    sections: [
      {
        type: 'opening',
        title: 'Pause',
        text: 'Before you open this screen, stop.\n\nThis is a threshold. On the other side is noise, distraction, and the pull of a thousand things that do not matter. But also: your work, your vocation, the tasks God has set before you today.',
      },
      {
        type: 'sorrow',
        title: 'Intention',
        text: 'Lord, I open this screen as an act of intention, not impulse.\n\nGuard my eyes from what does not serve You.\nGuard my time from what does not build Your kingdom.\nGuard my heart from the restless scrolling that empties rather than fills.\n\n"Whatever your task, work heartily, as serving the Lord and not men."\n— Colossians 3:23',
      },
      {
        type: 'closing',
        title: 'Commission',
        text: 'I will use this tool. It will not use me.\n\nSt. Isidore of Seville, patron of the internet, pray for me.\nHoly Spirit, be my focus.\n\nAmen.\n\nNow — what did you come here to do? Do that, and only that.',
      },
    ],
  },
  {
    id: 'cleansing-prayer',
    title: 'Cleansing Prayer — After a Fall',
    shortTitle: 'Cleansing Prayer',
    description: 'Reset after a fall. Acknowledge, receive mercy, move forward without spiraling.',
    audioFile: null,
    audioStartSeconds: 0,
    starred: false,
    sections: [
      {
        type: 'opening',
        title: 'Acknowledge',
        text: 'You fell.\n\nYou don\'t need to analyze it, dramatize it, or spiral about it. You fell. It happened. Name it plainly to God — He already knows.\n\n"If we confess our sins, He is faithful and just to forgive us our sins and to cleanse us from all unrighteousness."\n— 1 John 1:9',
      },
      {
        type: 'sorrow',
        title: 'Receive',
        text: '"My grace is sufficient for you, for my power is made perfect in weakness."\n— 2 Corinthians 12:9\n\nThe Enemy wants you to stay down. To believe this fall defines you. It does not.\n\n"A righteous man falls seven times, and rises again."\n— Proverbs 24:16\n\nSeven times. Not once. Not twice. Seven. And he rises. Every time.',
      },
      {
        type: 'closing',
        title: 'Rise',
        text: 'Lord Jesus Christ, Son of God, have mercy on me, a sinner.\n\nI accept Your mercy. I refuse shame. I rise.\n\n"Flee from sin as from a snake."\n— Sirach 21:2\n\nI choose to walk forward. Not perfectly — but forward. One step. That is enough for now.\n\nSt. Michael the Archangel, defend me in battle.\n\nAmen.',
      },
    ],
  },
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
