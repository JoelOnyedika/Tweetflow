import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ColorPicker = ({ color, onChange, label }) => {
  return (
    <div className="flex items-center space-x-2">
      <Label className="w-24">{label}</Label>
      <div className="flex-1 flex items-center space-x-2">
        <Input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 p-0 border-0"
        />
        <Input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
      </div>
      <div
        className="w-8 h-8 border border-gray-300 rounded"
        style={{ backgroundColor: color }}
      ></div>
    </div>
  );
};

export default ColorPicker;