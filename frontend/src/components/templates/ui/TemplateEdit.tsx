import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import ColorPicker from "@/components/ui/color-picker";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function TemplateEdit({ templateSettings, handleSettingChange, saveTemplate }) {
  const [editableValues, setEditableValues] = useState({
    fontSize: templateSettings.fontSize,
    lineHeight: templateSettings.lineHeight,
    marginTop: templateSettings.marginTop,
    marginLeft: templateSettings.marginLeft,
    marginRight: templateSettings.marginRight,
    textAnim: templateSettings.textAnim,
    templateName: templateSettings.templateName,
    backgroundColor: templateSettings.backgroundColor,
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log(file);
      const reader = new FileReader();
      reader.onload = (e) => handleSettingChange("image", e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => handleSettingChange("video", e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleContentEditableChange = (setting, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setEditableValues({ ...editableValues, [setting]: numValue });
      handleSettingChange(setting, numValue);
    }
  };

  const renderEditableNumber = (setting, label, min, max) => (
    <div>
      <Label htmlFor={setting}>{label}: </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              id={setting}
              contentEditable
              suppressContentEditableWarning
              className="inline-block min-w-[30px] border-b border-dashed border-gray-400 focus:outline-none focus:border-solid focus:border-blue-500"
              onBlur={(e) => handleContentEditableChange(setting, e.target.textContent)}
            >
              {editableValues[setting]}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editable</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Slider
        className="mt-2"
        min={min}
        max={max}
        step={setting === "lineHeight" ? 0.1 : 1}
        value={[editableValues[setting]]}
        onValueChange={([value]) => handleContentEditableChange(setting, value)}
      />
    </div>
  );

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Template Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mt-2">
  <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
  <label htmlFor="image-upload" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded">
    Upload Image
  </label>
</div>

<div className="flex items-center space-x-2 mt-2">
  <Input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
  <label htmlFor="video-upload" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded">
    Upload Video
  </label>
</div>
          
          <div>
            <Label htmlFor="text">Template name</Label>
            <Input
              id="text"
              value={templateSettings.templateName}
              onChange={(e) => handleSettingChange("templateName", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="text">Sample Text</Label>
            <Input
              id="text"
              value={templateSettings.text}
              onChange={(e) => handleSettingChange("text", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="font-family">Font Family</Label>
            <Select
              value={templateSettings.fontFamily}
              onValueChange={(value) => handleSettingChange("fontFamily", value)}
            >
              <SelectTrigger id="font-family">
                <SelectValue>{templateSettings.fontFamily}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              </SelectContent>
            </Select>
          </div>
<div>
            <Label htmlFor="text-anim">Text animation type</Label>
            <Select
              value={templateSettings.textAnim}
              onValueChange={(value) => handleSettingChange("textAnim", value)}
            >
              <SelectTrigger id="text-anim">
                <SelectValue>{templateSettings.textAnim}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Typewriter">Typewriter Effect</SelectItem>
                <SelectItem value="Flow">Flow Effect</SelectItem>
                <SelectItem value="Falling">Falling Effect</SelectItem>
              </SelectContent>
            </Select>
          </div> {renderEditableNumber("fontSize", "Font Size (px)", 8, 72)}
          {renderEditableNumber("lineHeight", "Line Height", 1, 3)}
          <div>
            <Label>Text Color (Read)</Label>
            <ColorPicker
              color={templateSettings.textColor}
              onChange={(color) => handleSettingChange("textColor", color)}
            />
          </div>
          <div>
            <Label>Background Color</Label>
            <ColorPicker
              color={templateSettings.backgroundColor}
              onChange={(color: any) => handleSettingChange("backgroundColor", color)}
            />
          </div>
          <div>
            <Label>Text Outline Color</Label>
            <ColorPicker
              color={templateSettings.textOutline}
              onChange={(color) => handleSettingChange("textOutline", color)}
            />
          </div>
          {renderEditableNumber("marginTop", "Top Margin (px)", 0, 300)}
          {renderEditableNumber("marginLeft", "Left Margin (px)", 0, 100)}
          {renderEditableNumber("marginRight", "Right Margin (px)", 0, 100)}
          <div className="flex space-x-4">
            <Button onClick={saveTemplate}>Save Template</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}