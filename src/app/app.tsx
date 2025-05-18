"use client";

import React, { useEffect } from 'react';
import { 
  Panel, 
  PanelGroup, 
  PanelResizeHandle,
  ImperativePanelHandle 
} from 'react-resizable-panels';
import useLayoutStore from '@/store/layoutStore';

// Import panel components
import ChatTester from '@/components/panels/ChatTester';
import GraphCanvas from '@/components/panels/GraphCanvas';
import DetailPanel from '@/components/panels/DetailPanel';

export default function App() {
  // Refs for imperative panel handling
  const leftPanelRef = React.useRef<ImperativePanelHandle>(null);
  const centerPanelRef = React.useRef<ImperativePanelHandle>(null);
  const rightPanelRef = React.useRef<ImperativePanelHandle>(null);
  
  // Get layout state and actions
  const { 
    MIN_PANE_WIDTH,
    leftPaneSize, 
    centerPaneSize, 
    rightPaneSize,
    setLeftPaneSize,
    setCenterPaneSize,
    setRightPaneSize
  } = useLayoutStore();
  
  // Calculate min sizes as percentages based on MIN_PANE_WIDTH
  // This assumes the container is 100vw wide
  const getMinSize = () => {
    if (typeof window === 'undefined') return 10; // Default for SSR
    return (MIN_PANE_WIDTH / window.innerWidth) * 100;
  };

  // Resize event listener to ensure minimum widths
  useEffect(() => {
    const handleResize = () => {
      const minSizePercent = getMinSize();
      
      // Only update if below minimum
      if (leftPanelRef.current && leftPaneSize < minSizePercent) {
        leftPanelRef.current.resize(minSizePercent);
      }
      
      if (centerPanelRef.current && centerPaneSize < minSizePercent) {
        centerPanelRef.current.resize(minSizePercent);
      }
      
      if (rightPanelRef.current && rightPaneSize < minSizePercent) {
        rightPanelRef.current.resize(minSizePercent);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [leftPaneSize, centerPaneSize, rightPaneSize, MIN_PANE_WIDTH]);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <PanelGroup direction="horizontal" className="h-full">
        {/* Left Pane - Chat Tester */}
        <Panel 
          id="left-panel"
          ref={leftPanelRef}
          defaultSize={leftPaneSize}
          minSize={getMinSize()}
          onResize={setLeftPaneSize}
          className="shadow-md z-10"
        >
          <ChatTester />
        </Panel>
        
        {/* Resize Handle */}
        <PanelResizeHandle className="w-1.5 bg-gray-200 hover:bg-blue-500 transition-colors cursor-col-resize" />
        
        {/* Center Pane - Graph Canvas */}
        <Panel 
          id="center-panel"
          ref={centerPanelRef}
          defaultSize={centerPaneSize}
          minSize={getMinSize()}
          onResize={setCenterPaneSize}
        >
          <GraphCanvas />
        </Panel>
        
        {/* Resize Handle */}
        <PanelResizeHandle className="w-1.5 bg-gray-200 hover:bg-blue-500 transition-colors cursor-col-resize" />
        
        {/* Right Pane - Detail Panel */}
        <Panel 
          id="right-panel"
          ref={rightPanelRef}
          defaultSize={rightPaneSize}
          minSize={getMinSize()}
          onResize={setRightPaneSize}
          className="shadow-md z-10"
        >
          <DetailPanel />
        </Panel>
      </PanelGroup>
    </div>
  );
}
