import { FeatureCard, IFeatureCard } from "./card"

const features: IFeatureCard[] = [
  {
    title: "Developer Friendly",
    description: (
      <p>
        While Eidos is just a web app with no web server, it also offers an API
        for developers to extend its functionality. Create your own workflows
        with ease.
        <br />
        <br />
        Wait, local web app with an API 🤔? Yes 😎! see{" "}
        <a
          href="https://github.com/mayneyao/eidos-api-agent-node"
          className="text-blue-500 underline"
        >
          how it works.
        </a>
      </p>
    ),
    lightImageUrl: "/show/api-light.webp",
    darkImageUrl: "/show/api-dark.webp",
  },
  {
    title: "SQLite Standardization",
    description: (
      <p>
        Every table in Eidos is a SQLite table. Access or modify the data using
        any SQLite client. <br />
        <br />
        SaaS may come and go, but your data in SQLite will always be there.
      </p>
    ),
    lightImageUrl: "/show/sqlite.webp",
    imgCls: "bg-blue-100 p-4",
  },
  {
    title: "Offline AI Capabilities",
    description: (
      <p>
        Download LLM once and use it anytime, even without an internet
        connection. No data leaves your device.
        <br />
        <br />
        It also works well with Ollama and any LLM provider compatible with
        OpenAI API.
      </p>
    ),
    lightImageUrl: "/show/offline-ai.webp",
    imgCls: "bg-teal-100 p-2",
  },
]

const officeExtServices: IFeatureCard[] = [
  {
    title: "Email Integration",
    description: (
      <p>
        Capture ideas, notes, and read/watch-it-later easily.
        <br />
        <br />
        Each resource in Eidos has a unique email address, allowing you to
        create or update resources simply by sending an email.
      </p>
    ),
    lightImageUrl: "/show/mail-to-eidos.webp",
    imgCls: "bg-red-100 p-4",
  },
]

const extendFeatures: IFeatureCard[] = [
  {
    title: "Prompt",
    description: (
      <p>
        Code knowledge is not required.
        <br />
        You can use the Prompt extension to speed up your workflow. Just like
        magic,{" "}
        <span className="animate-gradient inline bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent">
          what you SAY is what you get.
        </span>
      </p>
    ),
    lightImageUrl: "/show/custom-ai-prompt.webp",
    imgCls: "bg-indigo-100",
  },
  {
    title: "UDF(user-defined function)",
    description: "Use JavaScript to customize your Formula function.",
    lightImageUrl: "/show/ext-udf-light.webp",
    imgCls: "p-2 bg-yellow-100",
  },
  {
    title: "Script",
    description:
      "You can build your own data processing logic with TypeScript/JavaScript, which is really powerful.",
    lightImageUrl: "/show/script.webp",
    imgCls: "p-2 bg-pink-100",
  },
]

export const Features = () => {
  return (
    <div>
      <div className="mx-auto grid max-w-sm items-start gap-24 sm:max-w-4xl lg:max-w-5xl">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} even={index % 2 == 0} />
        ))}
      </div>

      <hr className="my-8" />
      <div className="container px-4 py-12 xs:px-0 md:px-6">
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Customize Everything
            </h2>
            <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Build your own unique Eidos with an easy and powerful extension
              system.
            </p>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-sm items-start gap-24 sm:max-w-4xl lg:max-w-5xl">
        {extendFeatures.map((feature, index) => (
          <FeatureCard key={index} {...feature} even={index % 2 == 0} />
        ))}
      </div>

      <hr className="my-8" />

      <div className="container px-4 py-6 xs:px-0 md:px-6">
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Addon Services(optional)
            </h2>

            <h3 className="text-2xl tracking-tighter sm:text-3xl">
              Local First. Cloud Opt-in.
            </h3>
            <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Here are some official services that can enhance your Eidos
              experience.
              <br />
              Still open source! You can build your own services.😎
            </p>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-sm items-start gap-24 sm:max-w-4xl lg:max-w-5xl">
        {officeExtServices.map((feature, index) => (
          <FeatureCard key={index} {...feature} even={index % 2 == 0} />
        ))}
      </div>
    </div>
  )
}
