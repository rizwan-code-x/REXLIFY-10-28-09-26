import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Zap, 
  Lightbulb, 
  Layers, 
  RotateCw, 
  Award,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const StudyNotesView: React.FC = () => {
  const [topicInput, setTopicInput] = useState('Foundational Principles of Neural Networks and Backpropagation');
  const [activeTab, setActiveTab] = useState<'notes' | 'revision' | 'flashcards' | 'quiz'>('notes');
  const [loading, setLoading] = useState(false);

  // Flashcards state
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const flashcards = [
    {
      front: 'What is Backpropagation?',
      back: 'The algorithm that calculates the gradient of the loss function with respect to each weight by the chain rule, enabling gradient descent optimization.'
    },
    {
      front: 'Why do we need Activation Functions?',
      back: 'Activation functions introduce non-linearity into neural networks, allowing them to learn complex non-linear mappings between inputs and outputs.'
    },
    {
      front: 'What is the Vanishing Gradient Problem?',
      back: 'In deep networks with sigmoid/tanh activations, gradients diminish exponentially as they propagate backward, causing early layers to train exceedingly slowly.'
    }
  ];

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: 'Which mathematical theorem underpins the backpropagation algorithm?',
      options: [
        'Central Limit Theorem',
        'Chain Rule of Calculus',
        'Bayes Theorem',
        'Pythagorean Theorem'
      ],
      correctIndex: 1,
      explanation: 'Backpropagation relies directly on the chain rule to recursively compute partial derivatives across layer compositions.'
    },
    {
      id: 2,
      question: 'What is the primary benefit of ReLU over standard Sigmoid activation?',
      options: [
        'ReLU mitigates the vanishing gradient problem for positive inputs',
        'ReLU restricts outputs between -1 and +1',
        'ReLU requires complex exponential calculation',
        'ReLU prevents all overfitting automatically'
      ],
      correctIndex: 0,
      explanation: 'ReLU has a constant derivative of 1 for positive activations, which prevents gradients from decaying toward zero during backprop.'
    },
    {
      id: 3,
      question: 'In deep learning optimization, what does the Learning Rate hyperparameter dictate?',
      options: [
        'The total number of training epochs',
        'The step size taken toward a local minimum during weight updates',
        'The physical temperature of the GPU hardware',
        'The maximum vocabulary size of the model'
      ],
      correctIndex: 1,
      explanation: 'The learning rate scales the magnitude of parameter updates along the negative gradient direction.'
    }
  ];

  const handleSelectQuizOption = (questionId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleGenerateStudyNotes = async () => {
    if (!topicInput.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/rexlify-ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'study',
          prompt: topicInput,
          ceoMode: true
        })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50/90 to-purple-100/80 p-6 border border-pink-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white shadow-xs">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-sora">Study & Notes Suite</h1>
            <p className="text-xs text-slate-600">
              Transform lectures & topics into structured notes, exam revision points, flashcards & interactive quizzes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-2xl bg-white/80 p-1 border border-pink-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'notes' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab('revision')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'revision' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700'
              }`}
            >
              Revision
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'flashcards' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700'
              }`}
            >
              Flashcards
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'quiz' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700'
              }`}
            >
              Quiz Mode
            </button>
          </div>
        </div>
      </div>

      {/* Topic Input Bar */}
      <div className="rounded-3xl bg-white/90 border border-pink-200/80 p-4 shadow-xs flex items-center gap-3 backdrop-blur-md">
        <input
          type="text"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          placeholder="Enter a subject, chapter, or paste lecture text..."
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
        />
        <button
          onClick={handleGenerateStudyNotes}
          disabled={loading || !topicInput.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium text-xs shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
        >
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
          <span>Generate Study Suite</span>
        </button>
      </div>

      {/* Dynamic Tab Content */}
      <div className="space-y-6">
        {activeTab === 'notes' && (
          <div className="rounded-3xl bg-white/90 border border-pink-200/80 p-6 shadow-xs space-y-6 backdrop-blur-md">
            <div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                Chapter 04 Breakdown
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2 font-sora">
                Foundations of Neural Networks & Backpropagation
              </h2>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                  <Zap size={16} className="text-pink-600" />
                  <span>1. Architectural Overview</span>
                </h3>
                <p>
                  A multi-layer perceptron (MLP) consists of an input layer, one or more hidden layers, and an output layer. Each node performs an affine transformation (weighted sum plus bias) followed by an element-wise non-linear activation function.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100">
                <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                  <Layers size={16} className="text-purple-600" />
                  <span>2. The Mechanics of Backpropagation</span>
                </h3>
                <p>
                  Backpropagation computes the gradient of the scalar loss with respect to all network weights. It proceeds backward from the output layer, propagating the error signal via the chain rule. This eliminates redundant computations that would occur if gradients were evaluated independently.
                </p>
              </div>

              {/* Mnemonic Memory Tip */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                  <Lightbulb size={16} className="text-amber-600" />
                  <span>💡 মনে রাখার সহজ কৌশল (Mnemonic Trick)</span>
                </div>
                <p className="text-amber-950 font-medium">
                  "**F-L-B-U**" মনে রাখুন:
                  <br />
                  1. **F**orward Pass (Compute activations)
                  <br />
                  2. **L**oss Evaluation (Measure deviation)
                  <br />
                  3. **B**ackward Pass (Derive gradients via chain rule)
                  <br />
                  4. **U**pdate Weights (Step along descent vector)
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revision' && (
          <div className="rounded-3xl bg-white/90 border border-pink-200/80 p-6 shadow-xs space-y-4 backdrop-blur-md">
            <h3 className="text-base font-bold text-slate-900 font-sora">High-Yield Exam Revision Points</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Chain Rule Rule of Thumb', text: 'Output layer delta = (Prediction - Target) * ActivationDerivative.' },
                { title: 'Vanishing Gradients', text: 'Sigmoid saturates near 0 and 1 with near-zero derivatives; use ReLU or LeakyReLU.' },
                { title: 'Momentum Factor', text: 'Accelerates gradient vectors in the right direction and dampens oscillations.' },
                { title: 'Batch Normalization', text: 'Normalizes layer inputs to stabilize training and accelerate convergence.' }
              ].map((point, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white text-pink-700 shadow-2xs font-bold text-xs">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{point.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{point.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'flashcards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Click card to reveal answer</span>
              <button 
                onClick={() => setFlippedCard(null)}
                className="text-xs font-semibold text-pink-700 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
              >
                <RotateCw size={13} />
                <span>Reset Cards</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {flashcards.map((card, idx) => {
                const isFlipped = flippedCard === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setFlippedCard(isFlipped ? null : idx)}
                    className="min-h-[200px] p-6 rounded-3xl bg-white/90 border border-pink-200/80 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-md"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                        {isFlipped ? 'ANSWER' : 'QUESTION'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-3">
                        {isFlipped ? card.back : card.front}
                      </h4>
                    </div>

                    <div className="pt-4 border-t border-pink-100 flex items-center justify-between text-[11px] font-semibold text-pink-700">
                      <span>{isFlipped ? 'Flip to Question' : 'Reveal Answer'}</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="rounded-3xl bg-white/90 border border-pink-200/80 p-6 shadow-xs space-y-6 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <h3 className="text-base font-bold text-slate-900 font-sora flex items-center gap-2">
                <Award size={18} className="text-pink-600" />
                <span>Diagnostic Mastery Quiz</span>
              </h3>

              {quizSubmitted && (
                <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Score: {calculateScore()} / {quizQuestions.length} ({Math.round((calculateScore() / quizQuestions.length) * 100)}%)
                </div>
              )}
            </div>

            <div className="space-y-6">
              {quizQuestions.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl bg-pink-50/30 border border-pink-100 space-y-3">
                  <p className="text-xs font-bold text-slate-900">
                    {q.id}. {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[q.id] === optIdx;
                      const isCorrect = q.correctIndex === optIdx;

                      let btnStyle = 'bg-white hover:bg-pink-50 border-pink-200 text-slate-700';
                      if (isSelected) {
                        btnStyle = 'bg-pink-100 border-pink-500 text-pink-900 font-semibold';
                      }
                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-100 border-rose-400 text-rose-900';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectQuizOption(q.id, optIdx)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${btnStyle}`}
                        >
                          <span className="font-mono font-bold mr-2 text-slate-400">
                            {String.fromCharCode(65 + optIdx)})
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 rounded-xl bg-white border border-pink-200 text-xs text-slate-600 mt-2">
                      <span className="font-bold text-pink-700">Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-pink-100">
              {quizSubmitted ? (
                <button
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className="px-5 py-2 rounded-2xl bg-white hover:bg-pink-50 border border-pink-200 text-pink-900 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  Retry Quiz
                </button>
              ) : (
                <button
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length === 0}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Submit Answers & View Score
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
