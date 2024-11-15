import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ColorPicker from "@/components/ui/color-picker";
import { TIKTOK_HEIGHT } from "./TemplateCreator";
import { Loader2 } from 'lucide-react'
import { creditSystem } from "@/lib/constants";
import { useToast } from "@/components/customs/Toast";
import UploadDialog from "@/components/customs/UploadDialog";

const TemplateEdit = ({ templateSettings, handleSettingChange, saveTemplate, isSavingTemplate, setMediaStuff }) => {
  const [editableValues, setEditableValues] = useState({
    ...templateSettings
  });
  const { showToast, ToastContainer } = useToast();
  const [percentLoaded, setPercentLoaded] = useState(0)
  const [isFileUploading, setIsFileUploading] = useState(false)

  useEffect(() => {
      setEditableValues({
      ...templateSettings,
      fontSize: templateSettings.fontSize,
      lineHeight: templateSettings.lineHeight,
      marginTop: templateSettings.marginTop,
      marginLeft: templateSettings.marginLeft,
      marginRight: templateSettings.marginRight,
    })

  }, [templateSettings])

  // const handleMediaUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const fileType = file.type.split('/')[0];
  //   const validTypes = ['video', 'image'];
    
  //   if (!validTypes.includes(fileType)) {
  //     showToast("Please upload a valid video or image file");
  //     return;
  //   }

  //   try {
  //     // Create object URL for the file
  //     const objectUrl = URL.createObjectURL(file);
      
  //     // Update template settings with the new media
  //     handleSettingChange("media", {
  //       type: fileType,
  //       url: objectUrl,
  //       originalFile: file
  //     });
  //     setMediaStuff({ type: fileType, url: objectUrl, originalFile: file })
  //   } catch (error) {
  //     console.error("File processing error:", error);
  //     showToast("Error processing file. Please try again.");
  //   }
  // };

const handleMediaUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const fileType = file.type.split('/')[0];
  const validTypes = ['video', 'image'];
  
  if (!validTypes.includes(fileType)) {
    showToast("Please upload a valid video or image file");
    return;
  }
  
  handleSettingChange("media", file);
};

  const handleInputChange = (setting, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setEditableValues({ ...editableValues, [setting]: numValue });
      setEditableValues({ ...editableValues, [setting]: numValue });
      handleSettingChange(setting, numValue);
    }
  };

  const renderInput = (setting, label, min, max, step = 1) => (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={setting}>{label}</Label>
      <Input
        id={setting}
        type="number"
        min={min}
        max={max}
        step={step}
        value={editableValues[setting]}
        onChange={(e) => handleInputChange(setting, e.target.value)}
        className="w-full"
      />
    </div>
  );


  return (
    <Card className="w-full" disabled={isFileUploading}>
      <UploadDialog text={"Uploading file"} percentLoaded={percentLoaded} isFileUploading={isFileUploading}/>
    <ToastContainer />
      <CardContent className="p-6 space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Template Settings</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="image-upload" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded block text-center">
              Upload Image
            </Label>
            <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleMediaUpload} />
          </div>
          <div>
            <Label htmlFor="video-upload" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded block text-center">
              Upload Video
            </Label>
            <Input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleMediaUpload} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              value={templateSettings.templateName}
              onChange={(e) => handleSettingChange("templateName", e.target.value)}
              className="w-full"
            />
          </div>
          {/*<div>
            <Label htmlFor="text">Sample Text</Label>
            <Input
              id="text"
              value={templateSettings.text}
              onChange={(e) => handleSettingChange("text", e.target.value)}
              className="w-full"
            />
          </div>*/}
        </div>

        <div className="space-y-4">
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
                <SelectItem value="Arial-Bold">Arial</SelectItem>
                <SelectItem value="Courier-Bold">Courier</SelectItem>
                <SelectItem value="Amiri-Bold">Amiri</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="text-anim">Text Animation Type</Label>
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
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {renderInput("fontSize", "Font Size (px)", 8, 72)}
          {renderInput("lineHeight", "Line Height", 1, 3, 0.1)}
          {renderInput("marginTop", "Top Margin (px)", 0, TIKTOK_HEIGHT)}
          {renderInput("marginLeft", "Left Margin (px)", 0, 100)}
          {renderInput("marginRight", "Right Margin (px)", 0, 100)}
        </div>

        <div className="space-y-4">
          <div>
            <Label>Text Color</Label>
            <ColorPicker
              color={templateSettings.textColor}
              onChange={(color) => handleSettingChange("textColor", color)}
            />
          </div>
          <div>
            <Label>Background Color</Label>
            <ColorPicker
              color={templateSettings.backgroundColor}
              onChange={(color) => handleSettingChange("backgroundColor", color)}
            />
          </div>
          <div>
            <Label>Text Outline Color</Label>
            <ColorPicker
              color={templateSettings.textOutline}
              onChange={(color) => handleSettingChange("textOutline", color)}
            />
          </div>
        </div>

        <Button onClick={saveTemplate} disabled={isSavingTemplate} className="w-full font-semibold">{isSavingTemplate ? (<>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving template
        </>) : <span className='font-semibold'>{`Save Template: ${creditSystem.createTemplate} Credits`}</span>
        }
        </Button>
      </CardContent>
    </Card>
  );
};

export default TemplateEdit;