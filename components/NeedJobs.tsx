import { Ollie } from "./Ollie";
import { ButtonLink } from "./ui";

export function NeedJobs() {
  return (
    <div className="grid place-items-center gap-4 py-16 text-center">
      <Ollie size={120} />
      <h1 className="text-3xl font-black text-violet-900">Let&apos;s find your jobs first!</h1>
      <p className="text-xl font-semibold">Answer a few fun questions and I&apos;ll show you jobs you&apos;d love.</p>
      <ButtonLink href="/">Start with me 🦉</ButtonLink>
    </div>
  );
}
