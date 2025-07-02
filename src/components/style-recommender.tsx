'use client'

import { useState } from 'react';
import { getStyleRecommendation } from '@/ai/flows/style-recommendation';
import type { Customer } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function StyleRecommender({ customer }: { customer: Customer }) {
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendation = async () => {
    setIsLoading(true);
    setRecommendation('');

    const latestMeasurements = customer.measurementSets && customer.measurementSets.length > 0
        ? [...customer.measurementSets].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].measurements
        : [];

    if (!customer.orderHistory && !customer.preferences && latestMeasurements.length === 0) {
        toast({
            title: "Not enough information",
            description: "Please add order history, preferences, or measurements to generate a recommendation.",
            variant: "destructive"
        });
        setIsLoading(false);
        return;
    }

    const measurements = latestMeasurements.reduce((acc, m) => {
      acc[m.label] = m.value;
      return acc;
    }, {} as Record<string, number>);

    try {
      const result = await getStyleRecommendation({
        measurements,
        orderHistory: customer.orderHistory || 'Not provided',
        preferences: customer.preferences || 'Not provided',
      });
      setRecommendation(result.styleRecommendation);
    } catch (error) {
      console.error(error);
      toast({
        title: "AI Error",
        description: "Could not generate a recommendation at this time.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Wand2 className="text-primary"/> AI Style Recommender
        </CardTitle>
        <CardDescription>Generates a recommendation based on the customer's profile and LATEST measurements. The more details provided, the better the recommendation.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGetRecommendation} disabled={isLoading}>
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : 'Generate Recommendation'}
        </Button>
        {recommendation && (
          <div className="mt-6 p-4 bg-secondary rounded-lg border">
            <h4 className="font-headline text-lg mb-2">Recommendation:</h4>
            <p className="text-sm font-body whitespace-pre-wrap">{recommendation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
