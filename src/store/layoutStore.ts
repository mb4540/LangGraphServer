import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  // Default minimum width for each pane
  readonly MIN_PANE_WIDTH: number;
  
  // Pane sizes as percentages
  leftPaneSize: number;
  centerPaneSize: number;
  rightPaneSize: number;
  
  // Actions
  setLeftPaneSize: (size: number) => void;
  setCenterPaneSize: (size: number) => void;
  setRightPaneSize: (size: number) => void;
  resetLayout: () => void;
}

const DEFAULT_LEFT_SIZE = 25; // 25%
const DEFAULT_CENTER_SIZE = 50; // 50%
const DEFAULT_RIGHT_SIZE = 25; // 25%

const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      // Constants
      MIN_PANE_WIDTH: 250,
      
      // Initial state
      leftPaneSize: DEFAULT_LEFT_SIZE,
      centerPaneSize: DEFAULT_CENTER_SIZE,
      rightPaneSize: DEFAULT_RIGHT_SIZE,
      
      // Actions
      setLeftPaneSize: (leftPaneSize) => 
        set((state) => {
          // Adjust other panes proportionally
          const totalOtherPanes = state.centerPaneSize + state.rightPaneSize;
          const diff = leftPaneSize - state.leftPaneSize;
          const ratio = totalOtherPanes > 0 ? state.centerPaneSize / totalOtherPanes : 0.5;
          
          return {
            leftPaneSize,
            centerPaneSize: Math.max(0, state.centerPaneSize - diff * ratio),
            rightPaneSize: Math.max(0, state.rightPaneSize - diff * (1 - ratio)),
          };
        }),
      
      setCenterPaneSize: (centerPaneSize) => 
        set((state) => {
          // Adjust other panes proportionally
          const totalOtherPanes = state.leftPaneSize + state.rightPaneSize;
          const diff = centerPaneSize - state.centerPaneSize;
          const ratio = totalOtherPanes > 0 ? state.leftPaneSize / totalOtherPanes : 0.5;
          
          return {
            centerPaneSize,
            leftPaneSize: Math.max(0, state.leftPaneSize - diff * ratio),
            rightPaneSize: Math.max(0, state.rightPaneSize - diff * (1 - ratio)),
          };
        }),
      
      setRightPaneSize: (rightPaneSize) => 
        set((state) => {
          // Adjust other panes proportionally
          const totalOtherPanes = state.leftPaneSize + state.centerPaneSize;
          const diff = rightPaneSize - state.rightPaneSize;
          const ratio = totalOtherPanes > 0 ? state.leftPaneSize / totalOtherPanes : 0.5;
          
          return {
            rightPaneSize,
            leftPaneSize: Math.max(0, state.leftPaneSize - diff * ratio),
            centerPaneSize: Math.max(0, state.centerPaneSize - diff * (1 - ratio)),
          };
        }),
      
      resetLayout: () => set({
        leftPaneSize: DEFAULT_LEFT_SIZE,
        centerPaneSize: DEFAULT_CENTER_SIZE,
        rightPaneSize: DEFAULT_RIGHT_SIZE,
      }),
    }),
    {
      name: 'langgraph-layout',
    }
  )
);

export default useLayoutStore;
