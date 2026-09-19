export function Separator({ className = "", ...props }) {
  return <hr className={`border-t ${className}`} {...props} />
}

export default Separator
