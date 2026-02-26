import React, { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, UploadCloud, RefreshCw, Wand2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api, { PostPreviewResponse } from "@/services/api";

const CreatePost = () => {
    const { session } = useAuth();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Optional Inputs
    const [niche, setNiche] = useState("");
    const [tone, setTone] = useState("");
    const [goal, setGoal] = useState("");
    const [cta, setCta] = useState("");
    const [autoPost, setAutoPost] = useState(false);

    // Result
    const [generatedPost, setGeneratedPost] = useState<PostPreviewResponse | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files]);
            const newUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newUrls]);
            setGeneratedPost(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith("image/"));
        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files]);
            const newUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newUrls]);
            setGeneratedPost(null);
        }
    };

    const removeImage = (index: number) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);

        const newUrls = [...previewUrls];
        URL.revokeObjectURL(newUrls[index]);
        newUrls.splice(index, 1);
        setPreviewUrls(newUrls);
    };

    const handleGenerate = async () => {
        if (selectedFiles.length === 0) {
            toast.error("Please upload at least one image.");
            return;
        }

        if (!session?.access_token) {
            toast.error("You must be logged in.");
            return;
        }

        setIsGenerating(true);
        try {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append("images", file);
            });

            if (niche) formData.append("niche", niche);
            if (tone) formData.append("tone", tone);
            if (goal) formData.append("goal", goal);
            if (cta) formData.append("cta", cta);
            formData.append("auto_post", autoPost.toString());

            const response = await api.generatePost(session.access_token, formData);
            setGeneratedPost(response);
            setCurrentImageIndex(0);
            toast.success("Magic Caption generated! ✨");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate post. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFeedback = (type: 'like' | 'dislike') => {
        toast.success(type === 'like' ? "Thanks! We'll make more like this." : "Thanks! We'll improve next time.");
        // Future: Send to backend API
    };

    // Mock submission for now
    const [isPublishing, setIsPublishing] = useState(false);

    const handleSubmitPost = async () => {
        if (!generatedPost || !session?.access_token) return;

        setIsPublishing(true);
        try {
            // Use the first image for now, or handle carousel publishing
            const imagePath = generatedPost.optimized_image_paths[0];
            const imageUrl = imagePath.startsWith('http')
                ? imagePath
                : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${imagePath}`;

            await api.publishToInstagram(session.access_token, {
                image_url: imageUrl,
                caption: generatedPost.caption
            });

            toast.success("Posted successfully to Instagram!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to publish to Instagram");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted flex">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <header className="bg-card border-b border-border px-6 py-4 mb-8">
                    <div className="flex items-center gap-4">
                        <MobileNav />
                        <h1 className="font-display text-2xl font-bold text-foreground">
                            Create Post
                        </h1>
                    </div>
                </header>

                <div className="px-6 pb-12">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-display font-bold text-foreground">Draft Content</h2>
                                <p className="text-muted-foreground mt-1">Upload images (Carousel supported!) and let AI craft the caption.</p>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Left Column: Inputs */}
                            <div className="space-y-6">
                                {/* Image Upload */}
                                <Card
                                    className={`relative border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${selectedFiles.length > 0 ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50"
                                        }`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                >
                                    {selectedFiles.length === 0 && (
                                        <div onClick={() => document.getElementById("file-upload")?.click()} className="h-full w-full flex flex-col items-center justify-center">
                                            <input
                                                id="file-upload"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                                <UploadCloud className="h-8 w-8 text-foreground/50" />
                                            </div>
                                            <p className="text-lg font-medium text-foreground">Click or Drop Images Here</p>
                                            <p className="text-sm mt-1">Supports JPG, PNG (Max 10MB)</p>
                                        </div>
                                    )}

                                    {/* Carousel Preview Area */}
                                    {selectedFiles.length > 0 && (
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            {previewUrls.map((url, idx) => (
                                                <div key={idx} className="relative aspect-[4/5] rounded-lg overflow-hidden border border-border group">
                                                    <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <span className="sr-only">Remove</span>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    </button>
                                                </div>
                                            ))}
                                            {/* Add More Button */}
                                            <div
                                                onClick={() => document.getElementById("file-upload-add")?.click()}
                                                className="aspect-[4/5] flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                                            >
                                                <input
                                                    id="file-upload-add"
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                                <UploadCloud className="h-6 w-6 text-primary mb-2" />
                                                <span className="text-sm font-medium text-primary">Add More</span>
                                            </div>
                                        </div>
                                    )}
                                </Card>

                                {/* Controls */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Niche (Optional)</Label>
                                        <Select value={niche} onValueChange={setNiche}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Niche" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Tech & Coding">👨‍💻 Tech & Coding</SelectItem>
                                                <SelectItem value="Fitness & Health">💪 Fitness & Health</SelectItem>
                                                <SelectItem value="Business & Finance">💼 Business & Finance</SelectItem>
                                                <SelectItem value="Travel & Lifestyle">✈️ Travel & Lifestyle</SelectItem>
                                                <SelectItem value="Food & Cooking">🍳 Food & Cooking</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tone (Optional)</Label>
                                        <Select value={tone} onValueChange={setTone}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Tone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Professional">👔 Professional</SelectItem>
                                                <SelectItem value="Funny & Witty">😂 Funny & Witty</SelectItem>
                                                <SelectItem value="Bold & Controversial">🔥 Bold</SelectItem>
                                                <SelectItem value="Educational">📚 Educational</SelectItem>
                                                <SelectItem value="Casual & Friendly">👋 Casual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Goal (Optional)</Label>
                                        <Select value={goal} onValueChange={setGoal}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Goal" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Engagement (Comments)">💬 Engagement</SelectItem>
                                                <SelectItem value="Reach (Shares)">🚀 Reach</SelectItem>
                                                <SelectItem value="Sales (Clicks)">💰 Sales</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Call to Action (Optional)</Label>
                                        <input
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="e.g. Link in bio"
                                            value={cta}
                                            onChange={(e) => setCta(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Auto-Post</Label>
                                        <p className="text-xs text-muted-foreground">Automatically publish at the best time</p>
                                    </div>
                                    <Switch checked={autoPost} onCheckedChange={setAutoPost} />
                                </div>

                                <Button
                                    className="w-full h-12 text-lg font-semibold shadow-lg"
                                    size="lg"
                                    onClick={handleGenerate}
                                    disabled={isGenerating || selectedFiles.length === 0}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Vision AI Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="mr-2 h-5 w-5" /> Generate Magic Caption
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Right Column: Preview */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-8 w-1 bg-primary rounded-full" />
                                    <h2 className="text-xl font-semibold">Preview</h2>
                                </div>

                                {generatedPost ? (
                                    <Card className="p-0 overflow-hidden border-border bg-card shadow-xl animate-in fade-in zoom-in-95 duration-300">
                                        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                                                    {generatedPost.style} Style
                                                </span>
                                            </div>

                                            {/* Feedback Loop */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground mr-1">Like this result?</span>
                                                <button onClick={() => handleFeedback('like')} className="p-1.5 hover:bg-green-500/10 hover:text-green-500 rounded-md transition-colors" title="I like this">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714.211 1.412.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                                                </button>
                                                <button onClick={() => handleFeedback('dislike')} className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-colors" title="Improve this">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715-.211-1.413-.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"></path></svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Caption</Label>
                                                <Textarea
                                                    className="min-h-[120px] text-base leading-relaxed resize-none border-primary/20 focus:border-primary"
                                                    defaultValue={generatedPost.caption}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Hashtags</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {generatedPost.hashtags.map((tag, i) => (
                                                        <span key={i} className="text-blue-500 text-sm hover:underline cursor-pointer">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>


                                        </div>

                                        <div className="p-4 bg-muted/50 border-t border-border flex gap-3">
                                            <Button variant="outline" className="flex-1" onClick={handleGenerate}>
                                                <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                                            </Button>
                                            <Button className="flex-[2]" onClick={handleSubmitPost} disabled={isPublishing}>
                                                {isPublishing ? (
                                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>
                                                ) : (
                                                    <><Send className="mr-2 h-4 w-4" /> Post to Instagram</>
                                                )}
                                            </Button>
                                        </div>
                                    </Card>
                                ) : (
                                    <div className="h-full min-h-[400px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-card/50">
                                        <div className="p-4 bg-muted rounded-full mb-4">
                                            <Wand2 className="h-8 w-8 text-foreground/20" />
                                        </div>
                                        <p>Upload {selectedFiles.length > 0 ? 'images' : 'image'} to see magic preview</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreatePost;
