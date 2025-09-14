import * as React from "react";

export function RadioGroup({ children, onValueChange, className }) {
  const [selected, setSelected] = React.useState(null);

  const handleChange = (e) => {
    setSelected(e.target.value);
    onValueChange && onValueChange(e.target.value);
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          checked: child.props.value === selected,
          onChange: handleChange,
        })
      )}
    </div>
  );
}

export function RadioGroupItem({ id, value, checked, onChange }) {
  return (
    <input
      type="radio"
      id={id}
      name="radio"
      value={value}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
    />
  );
}
