export type ElementType =
  | 'Text Input'
  | 'Email Input'
  | 'Password Input'
  | 'Phone Input'
  | 'Number Input'
  | 'Text Area'
  | 'Dropdown'
  | 'Checkbox'
  | 'Radio Button'
  | 'Button'
  | 'Image'
  | 'Label'
  | 'Link'
  | 'Container'
  | 'Custom Element';

export type ActionType =
  | 'Navigate'
  | 'ShowElement'
  | 'HideElement'
  | 'ToggleElement'
  | 'ChangeText'
  | 'ChangeImage'
  | 'ChangeStyle'
  | 'OpenUrl'
  | 'DownloadFile'
  | 'SubmitForm'
  | 'ResetForm'
  | 'TriggerAnimation'
  | 'DisplayPopup'
  | 'DisplayNotification'
  | 'RunCustomWorkflow'
  | 'TriggerElement'
  | 'TogglePasswordMasking'
  | 'ToggleCheckbox';

export interface Action {
  id: string;
  type: ActionType;
  params: {
    targetPageId?: string;       // For 'Navigate'
    targetElementId?: string;    // For 'ShowElement', 'HideElement', 'ToggleElement', 'ChangeText', 'ChangeStyle', 'TriggerElement', etc.
    textValue?: string;          // For 'ChangeText'
    imageUrl?: string;           // For 'ChangeImage'
    styleKey?: string;           // For 'ChangeStyle' (e.g. 'bg', 'text', 'border')
    styleValue?: string;         // For 'ChangeStyle'
    url?: string;                // For 'OpenUrl', 'DownloadFile'
    fileName?: string;           // For 'DownloadFile'
    popupTitle?: string;         // For 'DisplayPopup'
    popupMessage?: string;       // For 'DisplayPopup'
    notificationMessage?: string;// For 'DisplayNotification'
    notificationType?: 'info' | 'success' | 'warning' | 'error';
    workflowName?: string;       // For 'RunCustomWorkflow'
    animationName?: 'fade' | 'bounce' | 'shake' | 'zoom' | 'slideUp'; // For 'TriggerAnimation'

    // Toast design custom fields
    toastPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    toastTheme?: 'dark' | 'light' | 'colored' | 'glass';
    toastDuration?: number; // duration in milliseconds
    toastShowIcon?: boolean;

    // Popup custom design fields
    popupPlacement?: 'center' | 'top' | 'bottom';
    popupTheme?: 'classic-dark' | 'fancy-light' | 'neon-glow' | 'danger-red';
    popupAnimation?: 'bounce' | 'slideUp' | 'fade' | 'zoom';
    popupWidth?: string; // class name e.g. "max-w-md"
    popupShowCloseButton?: boolean;
    popupBackdropStyle?: 'dim' | 'blur' | 'transparent';

    // Custom Web Redirection security warns
    urlTarget?: '_blank' | '_self';
    urlWarn?: boolean;
    urlWarnMessage?: string;
  };
}

export interface ClickSequence {
  clickIndex: number; // 0-based: 0 means Click 1, 1 means Click 2, etc.
  actions: Action[];
}

export interface ConditionRule {
  id: string;
  name: string;
  sourceElementId: string; // The interactive input or value element
  conditionType: 'Empty' | 'NotEmpty' | 'Equals' | 'NotEquals' | 'Checked' | 'Unchecked' | 'LessThan' | 'GreaterThan';
  valueThreshold?: string; // value to compare
  successActions: Action[];
  failActions: Action[]; // Else actions
}

export interface ElementStyles {
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string;
  borderWidth?: string;
  fontSize?: string;
  fontFamily?: string;
  opacity?: number;
  textAlign?: 'left' | 'center' | 'right';
  transparent?: boolean;
  noBorder?: boolean;
  invisibleOnScreen?: boolean;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  label: string; // friendly element text/label (e.g., placeholder or value)
  x: number; // Left coordinate percent (0-100) of the canvas container
  y: number; // Top coordinate percent (0-100) of the canvas container
  width: number; // Width percent (0-100) of the canvas container
  height: number; // Height percent (0-100) of the canvas container
  zIndex: number;
  visible: boolean;
  locked: boolean;
  placeholder?: string;
  defaultValue?: string;
  imageUrl?: string;
  options?: string; // for dropdown / radios: comma-separated
  togglePasswordTargetId?: string; // Specific linked password field to show/hide
  styles: ElementStyles;
  clickSequences: ClickSequence[]; // Multi-click sequence: Click 1, Click 2...
  conditions: ConditionRule[]; // Conditional workflows
}

export interface Page {
  id: string;
  name: string;
  backgroundImage: string | null; // Base64 design or screenshot image
  elements: CanvasElement[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  previewImage?: string;
  pages: Page[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  pages: Page[];
  selectedPageId: string;
  createdAt: string;
  updatedAt: string;
}
