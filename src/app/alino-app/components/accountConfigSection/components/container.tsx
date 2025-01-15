interface props {
  typeSelected: string;
  children?: React.ReactNode;
}
export default function ContainerConfig({ typeSelected, children }: props) {
  return (
    <div>
      <p
        style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "rgb(200,200,200)",
        }}
      >
        {typeSelected}
      </p>
      {children}
    </div>
  );
}
