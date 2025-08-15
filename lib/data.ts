export type ResourceType = "book-presentation" | "game" | "summary" | "quiz" | "video" | "worksheet" | "file"

export interface Resource {
  id: string
  title: string
  type: ResourceType
  description?: string // Açıklama alanı
  link?: string // Ana link (oyunlar, videolar vb. için)
  previewLink?: string // Sunumlar için önizleme linki
  downloadLink?: string // Sunumlar için indirme linki
  fileUrl?: string // Dosya URL'si
  createdBy?: string // Kim tarafından oluşturuldu
  createdAt?: string // Ne zaman oluşturuldu
}

export interface Unit {
  id: number
  title: string
  resources: Resource[]
}

export interface Grade {
  id: string
  title: string
  category: "İlkokul" | "Ortaokul" | "Lise" | "Yabancı Dil" | "Evraklar" | "ELT Arena Ekibi" | "Bize Ulaşın"
  units: Unit[]
}

const resourceTemplates: Omit<Resource, "id" | "link" | "previewLink" | "downloadLink" | "fileUrl">[] = [
  {
    title: "MEB Ders Kitabı Sunumu",
    type: "book-presentation",
    description: "Resmi ders kitabına uygun hazırlanmış sunum materyali",
  },
  {
    title: "Jeopardy Oyunu",
    type: "game",
    description: "Eğlenceli soru-cevap oyunu ile konuyu pekiştirin",
  },
  {
    title: "Ezel Ballı Konu Özeti",
    type: "summary",
    description: "Konunun önemli noktalarını özetleyen materyal",
  },
  {
    title: "Ünite Değerlendirme Sınavı",
    type: "quiz",
    description: "Öğrenci başarısını ölçmek için hazırlanmış değerlendirme",
  },
  {
    title: "Konu Anlatım Videosu",
    type: "video",
    description: "Görsel ve işitsel öğrenmeyi destekleyen video içeriği",
  },
  {
    title: "Kelime Çalışması",
    type: "worksheet",
    description: "Ünitedeki önemli kelimelerin öğrenilmesi için hazırlanmış çalışma",
  },
]

// Örnek materyal linkleri
const sampleLinks = {
  "book-presentation": {
    preview:
      "https://view.officeapps.live.com/op/embed.aspx?src=https://file-examples.com/storage/fe19e15eac6560f8c990461/2017/02/file_example_PPTX_250kB.pptx",
    download: "https://file-examples.com/storage/fe19e15eac6560f8c990461/2017/02/file_example_PPTX_250kB.pptx",
  },
  game: "https://wordwall.net/tr/resource/102938/t%c3%bcrk%c3%a7e/kelime-oyunu",
  summary: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  quiz: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  worksheet: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  file: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
}

const generateResources = (): Resource[] => {
  return resourceTemplates.map((res, index) => {
    if (res.type === "book-presentation") {
      return {
        ...res,
        id: `${res.type}-${index}`,
        previewLink: sampleLinks["book-presentation"].preview,
        downloadLink: sampleLinks["book-presentation"].download,
      }
    }
    return {
      ...res,
      id: `${res.type}-${index}`,
      link: sampleLinks[res.type as keyof typeof sampleLinks] as string,
    }
  })
}

const generateUnits = (count: number): Unit[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `${i + 1}. Ünite`,
    resources: generateResources(),
  }))
}

export const grades: Grade[] = [
  // İlkokul
  { id: "2", title: "2. Sınıf", category: "İlkokul", units: generateUnits(8) },
  { id: "3", title: "3. Sınıf", category: "İlkokul", units: generateUnits(10) },
  { id: "4", title: "4. Sınıf", category: "İlkokul", units: generateUnits(10) },
  // Ortaokul
  { id: "5", title: "5. Sınıf", category: "Ortaokul", units: generateUnits(8) },
  { id: "6", title: "6. Sınıf", category: "Ortaokul", units: generateUnits(10) },
  { id: "7", title: "7. Sınıf", category: "Ortaokul", units: generateUnits(10) },
  { id: "8", title: "8. Sınıf", category: "Ortaokul", units: generateUnits(10) },
  // Yabancı Dil
  { id: "5-yd", title: "5. Sınıf (Yabancı Dil)", category: "Yabancı Dil", units: generateUnits(16) },
  { id: "6-yd", title: "6. Sınıf (Yabancı Dil)", category: "Yabancı Dil", units: generateUnits(16) },
  // Lise
  { id: "9", title: "9. Sınıf", category: "Lise", units: generateUnits(8) },
  { id: "10", title: "10. Sınıf", category: "Lise", units: generateUnits(10) },
  { id: "11", title: "11. Sınıf", category: "Lise", units: generateUnits(10) },
  { id: "12", title: "12. Sınıf", category: "Lise", units: generateUnits(10) },
]
