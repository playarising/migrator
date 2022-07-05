import Image from "next/image";

export default function Home(): JSX.Element {
  return (
    <>
      <div className="w-[400px] mx-auto">
        <div className="mx-auto">
          <Image src="/logo.png" width="400px" height="250px" />
        </div>
      </div>
      <div className="px-5">
        <h1 className="text-white text-3xl text-center">Rarity Migrator</h1>
        <p className="text-white text-lg text-center my-2">
          This tool will help you convert all your Rarity Manifested assets into
          Arising.
        </p>
        <p className="text-white text-lg text-center">
          None of your rarity elements will be burned or transferred. This tool
          will only count them and convert them to EXPERIENCE that can be used
          later to one or multiple Arising characters once the game is
          available.
        </p>
      </div>
    </>
  );
}
