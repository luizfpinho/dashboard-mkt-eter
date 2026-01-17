'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Settings2, Palette, Type, Image, Share2 } from 'lucide-react';

// Constantes
const GAMMA_THEMES = [
  { id: 'default-light', name: 'Basic Light', description: 'Tema padrão claro e profissional' },
  { id: 'default-dark', name: 'Basic Dark', description: 'Tema padrão escuro e elegante' },
  { id: 'chisel', name: 'Chisel', description: 'Profissional e moderno' },
  { id: 'consultant', name: 'Consultant', description: 'Corporativo e formal' },
  { id: 'aurora', name: 'Aurora', description: 'Gradientes vibrantes' },
  { id: 'gamma', name: 'Gamma', description: 'Cores quentes e criativas' },
  { id: 'gamma-dark', name: 'Gamma Dark', description: 'Escuro com gradientes' },
  { id: 'ash', name: 'Ash', description: 'Preto e branco minimalista' },
  { id: 'coal', name: 'Coal', description: 'Cinza profissional' },
  { id: 'electric', name: 'Electric', description: 'Cores vibrantes e modernas' },
  { id: 'blues', name: 'Blues', description: 'Azul profundo e elegante' },
  { id: 'coral-glow', name: 'Coral Glow', description: 'Coral e tons pastéis' },
  { id: 'atmosphere', name: 'Atmosphere', description: 'Gradientes suaves' },
  { id: 'dune', name: 'Dune', description: 'Bege e tons terrosos' },
  { id: 'founder', name: 'Founder', description: 'Escuro e profissional' },
];

const GAMMA_LANGUAGES = [
  { code: 'pt-br', name: 'Português (Brasil)' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '中文' },
];

const IMAGE_STYLES = [
  { id: 'photorealistic', name: 'Fotorrealista' },
  { id: 'illustration', name: 'Ilustração' },
  { id: 'abstract', name: 'Abstrato' },
  { id: 'minimalist', name: 'Minimalista' },
  { id: '3d-render', name: 'Render 3D' },
  { id: 'watercolor', name: 'Aquarela' },
  { id: 'corporate', name: 'Corporativo' },
  { id: 'vintage', name: 'Vintage' },
];

const TONE_PRESETS = [
  { id: 'professional', name: 'Profissional', value: 'professional, executive, data-driven' },
  { id: 'casual', name: 'Casual', value: 'casual, friendly, conversational' },
  { id: 'inspiring', name: 'Inspirador', value: 'inspiring, motivational, energetic' },
  { id: 'formal', name: 'Formal', value: 'formal, academic, technical' },
  { id: 'creative', name: 'Criativo', value: 'creative, innovative, bold' },
  { id: 'educational', name: 'Educativo', value: 'educational, informative, clear' },
  { id: 'persuasive', name: 'Persuasivo', value: 'persuasive, compelling, action-oriented' },
  { id: 'custom', name: 'Personalizado', value: '' },
];

export interface GammaConfig {
  // Formato
  format: 'presentation' | 'document' | 'social' | 'webpage';
  numCards: number;
  cardSplit: 'auto' | 'inputTextBreaks';
  textMode: 'generate' | 'condense' | 'preserve';

  // Tema
  themeId: string;
  dimensions: 'fluid' | '16x9' | '4x3';

  // Texto
  textAmount: 'brief' | 'medium' | 'detailed' | 'extensive';
  tone: string;
  tonePreset: string;
  audience: string;
  language: string;

  // Imagens
  imageSource: 'aiGenerated' | 'unsplash' | 'noImages' | 'webAllImages' | 'placeholder';
  imageModel: string;
  imageStyle: string;

  // Exportação
  exportAs: 'pdf' | 'pptx';

  // Compartilhamento
  workspaceAccess: 'noAccess' | 'view' | 'comment' | 'edit' | 'fullAccess';
  externalAccess: 'noAccess' | 'view' | 'comment';

  // Instruções
  additionalInstructions: string;
}

interface GammaConfigPanelProps {
  config: GammaConfig;
  onChange: (config: GammaConfig) => void;
}

export function GammaConfigPanel({ config, onChange }: GammaConfigPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateConfig = (updates: Partial<GammaConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      {/* CONFIGURAÇÕES BÁSICAS */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Configurações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formato de Saída */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select
                value={config.format}
                onValueChange={(v) => updateConfig({ format: v as GammaConfig['format'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presentation">📊 Apresentação</SelectItem>
                  <SelectItem value="document">📄 Documento</SelectItem>
                  <SelectItem value="social">📱 Social Media</SelectItem>
                  <SelectItem value="webpage">🌐 Página Web</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Exportar como</Label>
              <Select
                value={config.exportAs}
                onValueChange={(v) => updateConfig({ exportAs: v as 'pdf' | 'pptx' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pptx">PowerPoint (.pptx)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantidade de Slides */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Quantidade de Slides</Label>
              <span className="text-sm text-muted-foreground">{config.numCards} slides</span>
            </div>
            <Slider
              value={[config.numCards]}
              onValueChange={([v]) => updateConfig({ numCards: v })}
              min={3}
              max={15}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mínimo: 3</span>
              <span>Máximo: 15</span>
            </div>
          </div>

          {/* Proporção (se for apresentação) */}
          {config.format === 'presentation' && (
            <div className="space-y-2">
              <Label>Proporção dos Slides</Label>
              <Select
                value={config.dimensions}
                onValueChange={(v) => updateConfig({ dimensions: v as GammaConfig['dimensions'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16x9">16:9 (Widescreen)</SelectItem>
                  <SelectItem value="4x3">4:3 (Tradicional)</SelectItem>
                  <SelectItem value="fluid">Fluido (Adaptável)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TEMA */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Tema e Aparência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <Select
              value={config.themeId}
              onValueChange={(v) => updateConfig({ themeId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tema" />
              </SelectTrigger>
              <SelectContent>
                {GAMMA_THEMES.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    <div className="flex flex-col">
                      <span>{theme.name}</span>
                      <span className="text-xs text-muted-foreground">{theme.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* TEXTO E CONTEÚDO */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="h-4 w-4" />
            Texto e Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade de Texto</Label>
              <Select
                value={config.textAmount}
                onValueChange={(v) => updateConfig({ textAmount: v as GammaConfig['textAmount'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Breve</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="detailed">Detalhado</SelectItem>
                  <SelectItem value="extensive">Extenso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Idioma</Label>
              <Select
                value={config.language}
                onValueChange={(v) => updateConfig({ language: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GAMMA_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tom da Apresentação</Label>
            <Select
              value={config.tonePreset}
              onValueChange={(v) => {
                const preset = TONE_PRESETS.find(p => p.id === v);
                updateConfig({
                  tonePreset: v,
                  tone: preset?.value || config.tone
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_PRESETS.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {config.tonePreset === 'custom' && (
            <div className="space-y-2">
              <Label>Tom Personalizado</Label>
              <Input
                value={config.tone}
                onChange={(e) => updateConfig({ tone: e.target.value })}
                placeholder="Ex: professional, inspiring, data-driven"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{config.tone.length}/500 caracteres</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Público-alvo</Label>
            <Input
              value={config.audience}
              onChange={(e) => updateConfig({ audience: e.target.value })}
              placeholder="Ex: gestores de marketing, diretores, C-level"
              maxLength={500}
            />
          </div>
        </CardContent>
      </Card>

      {/* IMAGENS */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Image className="h-4 w-4" />
            Imagens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Fonte das Imagens</Label>
            <Select
              value={config.imageSource}
              onValueChange={(v) => updateConfig({ imageSource: v as GammaConfig['imageSource'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aiGenerated">🤖 Geradas por IA</SelectItem>
                <SelectItem value="unsplash">📷 Unsplash</SelectItem>
                <SelectItem value="webAllImages">🌐 Web (Todas)</SelectItem>
                <SelectItem value="placeholder">🖼️ Placeholder</SelectItem>
                <SelectItem value="noImages">🚫 Sem Imagens</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.imageSource === 'aiGenerated' && (
            <>
              <div className="space-y-2">
                <Label>Modelo de IA</Label>
                <Select
                  value={config.imageModel}
                  onValueChange={(v) => updateConfig({ imageModel: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imagen-4-pro">Imagen 4 Pro (Recomendado)</SelectItem>
                    <SelectItem value="imagen-3">Imagen 3</SelectItem>
                    <SelectItem value="stable-diffusion">Stable Diffusion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estilo das Imagens</Label>
                <Select
                  value={config.imageStyle}
                  onValueChange={(v) => updateConfig({ imageStyle: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGE_STYLES.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        {style.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* CONFIGURAÇÕES AVANÇADAS (Collapsible) */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Configurações Avançadas
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 mt-4">
          {/* Modo de Texto */}
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label>Modo de Processamento do Texto</Label>
                <Select
                  value={config.textMode}
                  onValueChange={(v) => updateConfig({ textMode: v as GammaConfig['textMode'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generate">
                      <div className="flex flex-col">
                        <span>Gerar</span>
                        <span className="text-xs text-muted-foreground">Expande e reescreve o conteúdo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="condense">
                      <div className="flex flex-col">
                        <span>Condensar</span>
                        <span className="text-xs text-muted-foreground">Resume o conteúdo fornecido</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="preserve">
                      <div className="flex flex-col">
                        <span>Preservar</span>
                        <span className="text-xs text-muted-foreground">Mantém o texto original</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Divisão de Conteúdo</Label>
                <Select
                  value={config.cardSplit}
                  onValueChange={(v) => updateConfig({ cardSplit: v as GammaConfig['cardSplit'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automático</SelectItem>
                    <SelectItem value="inputTextBreaks">Por quebras de texto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Compartilhamento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Compartilhamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Acesso do Workspace</Label>
                <Select
                  value={config.workspaceAccess}
                  onValueChange={(v) => updateConfig({ workspaceAccess: v as GammaConfig['workspaceAccess'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="noAccess">Sem acesso</SelectItem>
                    <SelectItem value="view">Apenas visualizar</SelectItem>
                    <SelectItem value="comment">Comentar</SelectItem>
                    <SelectItem value="edit">Editar</SelectItem>
                    <SelectItem value="fullAccess">Acesso total</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Acesso Externo</Label>
                <Select
                  value={config.externalAccess}
                  onValueChange={(v) => updateConfig({ externalAccess: v as GammaConfig['externalAccess'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="noAccess">Sem acesso</SelectItem>
                    <SelectItem value="view">Apenas visualizar</SelectItem>
                    <SelectItem value="comment">Comentar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Instruções Adicionais */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Instruções Adicionais</CardTitle>
              <CardDescription>
                Instruções extras para personalizar a geração
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={config.additionalInstructions}
                onChange={(e) => updateConfig({ additionalInstructions: e.target.value })}
                placeholder="Ex: Use gráficos de barras para dados numéricos. Destaque números importantes em negrito. Use ícones modernos."
                rows={3}
              />
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Configuração padrão
export const DEFAULT_GAMMA_CONFIG: GammaConfig = {
  format: 'presentation',
  numCards: 10,
  cardSplit: 'auto',
  textMode: 'generate',
  themeId: 'chisel',
  dimensions: '16x9',
  textAmount: 'medium',
  tone: 'professional, executive, data-driven',
  tonePreset: 'professional',
  audience: 'gestores de marketing, diretores, C-level',
  language: 'pt-br',
  imageSource: 'aiGenerated',
  imageModel: 'imagen-4-pro',
  imageStyle: 'corporate',
  exportAs: 'pptx',
  workspaceAccess: 'view',
  externalAccess: 'view',
  additionalInstructions: '',
};
