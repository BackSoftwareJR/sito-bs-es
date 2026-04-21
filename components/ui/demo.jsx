import { ShinyButton } from "./shiny-button";

export default function DemoOne() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-8 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=80')",
      }}
    >
      <div className="bg-black/45 p-8 rounded-3xl backdrop-blur-sm">
        <ShinyButton onClick={() => alert("Button clicked!")}>Get unlimited access</ShinyButton>
      </div>
    </div>
  );
}

