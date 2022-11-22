interface IProps {
  children?: React.ReactNode
  type?: "primary" | "default"
}

const Button: React.FC<IProps> = (props) => {
  const typeClass = {
    default: "",
    primary: "bg-blue-500 text-white",
  }

  return (
    <button
      className={[
        "px-3",
        "py-1",
        "border",
        "border-solid",
        "border-gray-200",
        "rounded",
        "text-sm",
        "active:scale-95",
        typeClass[props?.type || "default"]
      ].join(" ")}
    >
      {props.children}
    </button>
  )
}

export default Button
