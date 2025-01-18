interface props {
  children?: React.ReactNode;
}
export default function ContainerConfig({ children }: props) {
  return <div style={{ width: "100%" }}>{children}</div>;
}
