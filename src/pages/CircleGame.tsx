import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Trophy, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Point {
  x: number;
  y: number;
}

interface CircleAnalysis {
  score: number;
  completeness: number;
  roundness: number;
  symmetry: number;
}

const CircleGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number>(0);
  const [analysis, setAnalysis] = useState<CircleAnalysis | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Load best score from localStorage
  useEffect(() => {
    const savedBestScore = localStorage.getItem('circleGameBestScore');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore, 10));
    }
  }, []);

  // Save best score to localStorage
  useEffect(() => {
    if (score !== null && score > bestScore) {
      setBestScore(score);
      localStorage.setItem('circleGameBestScore', score.toString());
      toast({
        title: "New Best Score! 🎉",
        description: `You achieved ${score} points!`,
      });
    }
  }, [score, bestScore]);

  const getCanvasCoordinates = (event: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;

    if ('touches' in event) {
      clientX = event.touches[0]?.clientX || event.changedTouches[0]?.clientX || 0;
      clientY = event.touches[0]?.clientY || event.changedTouches[0]?.clientY || 0;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const point = getCanvasCoordinates(event);
    setIsDrawing(true);
    setCurrentPath([point]);
    setScore(null);
    setAnalysis(null);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    }
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing) return;

    const point = getCanvasCoordinates(event);
    setCurrentPath(prev => [...prev, point]);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  };

  const stopDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing) return;

    setIsDrawing(false);
    setAttempts(prev => prev + 1);

    // Analyze the drawn circle
    if (currentPath.length > 10) {
      const analysis = analyzeCircle(currentPath);
      setAnalysis(analysis);
      setScore(analysis.score);
    } else {
      toast({
        title: "Draw a longer path",
        description: "Try drawing a complete circle for scoring.",
        variant: "destructive"
      });
    }
  };

  const analyzeCircle = (path: Point[]): CircleAnalysis => {
    if (path.length < 10) {
      return { score: 0, completeness: 0, roundness: 0, symmetry: 0 };
    }

    // Calculate center point
    const centerX = path.reduce((sum, p) => sum + p.x, 0) / path.length;
    const centerY = path.reduce((sum, p) => sum + p.y, 0) / path.length;

    // Calculate distances from center
    const distances = path.map(p => 
      Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2)
    );

    const avgRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    const maxRadius = Math.max(...distances);
    const minRadius = Math.min(...distances);

    // Completeness: Check if the path forms a closed loop
    const startPoint = path[0];
    const endPoint = path[path.length - 1];
    const closureDistance = Math.sqrt(
      (startPoint.x - endPoint.x) ** 2 + (startPoint.y - endPoint.y) ** 2
    );
    const completeness = Math.max(0, 100 - (closureDistance / avgRadius) * 50);

    // Roundness: How consistent the radius is
    const radiusVariance = distances.reduce((sum, d) => sum + (d - avgRadius) ** 2, 0) / distances.length;
    const radiusStdDev = Math.sqrt(radiusVariance);
    const roundness = Math.max(0, 100 - (radiusStdDev / avgRadius) * 200);

    // Symmetry: Check angular distribution
    const angles = path.map(p => Math.atan2(p.y - centerY, p.x - centerX));
    const sortedAngles = [...angles].sort((a, b) => a - b);
    
    let symmetryScore = 100;
    if (sortedAngles.length > 1) {
      const expectedAngleStep = (2 * Math.PI) / sortedAngles.length;
      let angleVariance = 0;
      
      for (let i = 1; i < sortedAngles.length; i++) {
        const actualStep = sortedAngles[i] - sortedAngles[i - 1];
        angleVariance += (actualStep - expectedAngleStep) ** 2;
      }
      
      const avgAngleVariance = angleVariance / (sortedAngles.length - 1);
      symmetryScore = Math.max(0, 100 - Math.sqrt(avgAngleVariance) * 50);
    }

    // Calculate final score (weighted average)
    const finalScore = Math.round(
      completeness * 0.3 + roundness * 0.5 + symmetryScore * 0.2
    );

    return {
      score: Math.max(0, Math.min(100, finalScore)),
      completeness: Math.round(completeness),
      roundness: Math.round(roundness),
      symmetry: Math.round(symmetryScore)
    };
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    setCurrentPath([]);
    setScore(null);
    setAnalysis(null);
    setIsDrawing(false);
  }, []);

  // Initialize canvas
  useEffect(() => {
    clearCanvas();
  }, [clearCanvas]);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 95) return 'Perfect! 🎯';
    if (score >= 90) return 'Excellent! ⭐';
    if (score >= 80) return 'Great! 👍';
    if (score >= 70) return 'Good! 👌';
    if (score >= 50) return 'Not bad! 🙂';
    return 'Keep trying! 💪';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Target className="w-8 h-8 text-blue-600" />
            Perfect Circle Drawing Game
          </h1>
          <p className="text-gray-600 text-lg">
            Draw the most perfect circle you can and get scored on your accuracy!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Canvas */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-center">Drawing Board</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    className="w-full h-auto cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {currentPath.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-gray-400 text-lg">Draw a circle here</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={clearCanvas}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear & Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Score Panel */}
          <div className="space-y-6">
            {/* Current Score */}
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Your Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                {score !== null ? (
                  <div className="text-center space-y-4">
                    <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                      {score}
                    </div>
                    <div className="text-lg text-gray-600">
                      {getScoreMessage(score)}
                    </div>
                    {analysis && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Completeness:</span>
                          <Badge variant="outline">{analysis.completeness}%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Roundness:</span>
                          <Badge variant="outline">{analysis.roundness}%</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Symmetry:</span>
                          <Badge variant="outline">{analysis.symmetry}%</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Draw a circle to get your score!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Best Score:</span>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {bestScore}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Attempts:</span>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {attempts}
                  </Badge>
                </div>
                {attempts > 0 && score !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average:</span>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {Math.round(score)}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">1.</span>
                  <span>Draw a circle on the white board using your mouse or finger</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">2.</span>
                  <span>Try to make it as round and complete as possible</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">3.</span>
                  <span>Get scored on completeness, roundness, and symmetry</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-blue-600">4.</span>
                  <span>Aim for a perfect score of 100!</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleGame;