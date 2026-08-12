import { addPropertyControls, ControlType } from "framer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SkillpathView, { type Props } from "./Skillpath";
import "./styles.css";

const queryClient = new QueryClient();

export default function Skillpath(props: Props) {
  return <QueryClientProvider client={queryClient}><SkillpathView {...props} /></QueryClientProvider>;
}

addPropertyControls(Skillpath, {
  accentColor: {
    type: ControlType.Color,
    title: "Accent",
    defaultValue: "#e3ff5c",
  },
  cardRadius: {
    type: ControlType.Number,
    title: "Card radius",
    min: 0,
    max: 36,
    step: 2,
    defaultValue: 20,
  },
});

export type { Props };
