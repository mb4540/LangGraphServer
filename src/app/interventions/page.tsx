"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HumanIntervention {
  id: string;
  message: string;
  state: Record<string, any>;
  required_fields: string[];
  allow_edits: boolean;
  created_at: string;
  completed: boolean;
  timed_out: boolean;
}

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<HumanIntervention[]>([]);
  const [selectedIntervention, setSelectedIntervention] = useState<HumanIntervention | null>(null);
  const [editedState, setEditedState] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // Fetch pending interventions
  const fetchInterventions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/human-intervention/pending');
      
      if (!response.ok) {
        throw new Error('Failed to fetch interventions');
      }
      
      const data = await response.json();
      setInterventions(data);
      setError("");
    } catch (err) {
      setError("Error fetching interventions: " + (err as Error).message);
      console.error('Error fetching interventions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load the details of a specific intervention
  const loadIntervention = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/human-intervention/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load intervention details');
      }
      
      const data = await response.json();
      setSelectedIntervention(data);
      setEditedState(JSON.stringify(data.state, null, 2));
    } catch (err) {
      setError("Error loading intervention: " + (err as Error).message);
      console.error('Error loading intervention:', err);
    } finally {
      setLoading(false);
    }
  };

  // Resume workflow with updated state
  const resumeWorkflow = async (skipped: boolean = false) => {
    if (!selectedIntervention) return;
    
    try {
      setLoading(true);
      
      let stateData = selectedIntervention.state;
      
      // Parse the edited state if not skipped and edits are allowed
      if (!skipped && selectedIntervention.allow_edits) {
        try {
          stateData = JSON.parse(editedState);
        } catch (parseError) {
          setError("Invalid JSON state format");
          setLoading(false);
          return;
        }
      }
      
      // Check required fields
      if (!skipped && selectedIntervention.required_fields && selectedIntervention.required_fields.length > 0) {
        for (const field of selectedIntervention.required_fields) {
          if (!stateData[field]) {
            setError(`Required field '${field}' is missing from state`);
            setLoading(false);
            return;
          }
        }
      }
      
      const response = await fetch(`/api/human-intervention/${selectedIntervention.id}/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: stateData,
          skip: skipped
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to resume workflow');
      }
      
      // Reset selected intervention and refresh list
      setSelectedIntervention(null);
      fetchInterventions();
      setError("");
    } catch (err) {
      setError("Error resuming workflow: " + (err as Error).message);
      console.error('Error resuming workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch interventions on component mount
  useEffect(() => {
    fetchInterventions();
    
    // Set up polling to periodically refresh the list
    const intervalId = setInterval(fetchInterventions, 5000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Human Interventions</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Interventions List */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Pending Interventions</h2>
              <button 
                onClick={fetchInterventions}
                disabled={loading}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Refresh
              </button>
            </div>
            
            {loading && !selectedIntervention ? (
              <div className="py-4 text-center text-gray-500">Loading...</div>
            ) : interventions.length === 0 ? (
              <div className="py-4 text-center text-gray-500">No pending interventions</div>
            ) : (
              <ul className="space-y-2">
                {interventions.map(intervention => (
                  <li 
                    key={intervention.id}
                    className={`p-3 rounded-md cursor-pointer ${selectedIntervention?.id === intervention.id ? 'bg-blue-100 border-blue-300 border' : 'bg-gray-50 hover:bg-gray-100'}`}
                    onClick={() => loadIntervention(intervention.id)}
                  >
                    <div className="font-medium truncate">{intervention.message}</div>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(intervention.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Intervention Details */}
        <div className="w-full md:w-2/3">
          {selectedIntervention ? (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-medium mb-4">{selectedIntervention.message}</h2>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm">
                <div className="font-medium">Instructions:</div>
                <p>
                  {selectedIntervention.allow_edits 
                    ? "You can modify the workflow state below. Make any necessary changes before continuing."
                    : "This intervention is view-only. You cannot modify the state."}
                </p>
                {selectedIntervention.required_fields && selectedIntervention.required_fields.length > 0 && (
                  <div className="mt-2">
                    <span className="font-medium">Required fields: </span>
                    {selectedIntervention.required_fields.join(", ")}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Workflow State:</label>
                <textarea
                  value={editedState}
                  onChange={(e) => setEditedState(e.target.value)}
                  disabled={!selectedIntervention.allow_edits}
                  rows={12}
                  className="font-mono w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => resumeWorkflow(true)}
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded-md"
                >
                  Skip
                </button>
                <button
                  onClick={() => resumeWorkflow(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                >
                  {loading ? "Processing..." : "Continue Workflow"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Select an intervention from the list to view and respond
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
