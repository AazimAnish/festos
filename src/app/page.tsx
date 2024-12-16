import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#b53937] flex items-center justify-center p-8">
      <main className="max-w-3xl text-center">
        <h1 className="text-[#f5f5f5] font-['Source_Serif_4'] text-4xl sm:text-6xl leading-relaxed font-bold">
          Coming Soon!
        </h1>
        <p className="text-[#f5f5f5] font-['Source_Serif_4'] text-xl sm:text-3xl leading-relaxed">
          Building an event is like the Colosseum—took 8 years. Don't worry, we won't take that long.
        </p>
      </main>
    </div>
  );
}

