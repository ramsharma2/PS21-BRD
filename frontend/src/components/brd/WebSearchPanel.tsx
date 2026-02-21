import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, Loader2, Globe, TrendingUp, Shield, Wrench } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/services/api';

interface SearchResult {
    title: string;
    snippet: string;
    url: string;
    relevance: number;
}

interface WebSearchPanelProps {
    projectName?: string;
    onResultsFound?: (results: SearchResult[]) => void;
}

export default function WebSearchPanel({ projectName, onResultsFound }: WebSearchPanelProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchType, setSearchType] = useState<'general' | 'best-practices' | 'technical' | 'compliance'>('general');
    const { toast } = useToast();

    const handleSearch = async () => {
        if (!query.trim()) {
            toast({
                title: "Query Required",
                description: "Please enter a search query",
                variant: "destructive",
            });
            return;
        }

        setIsSearching(true);
        try {
            let response;
            
            console.log('[WebSearchPanel] Starting search:', { query, searchType });
            
            switch (searchType) {
                case 'best-practices':
                    response = await api.searchBestPractices(query);
                    break;
                case 'technical':
                    response = await api.searchTechnicalSpecs(query);
                    break;
                case 'compliance':
                    response = await api.searchCompliance(query);
                    break;
                default:
                    response = await api.webSearch(query, 5);
            }

            console.log('[WebSearchPanel] Response received:', response);

            // Extract results from response - handle multiple possible response structures
            let searchResults = [];
            if (Array.isArray(response)) {
                searchResults = response;
            } else if (response?.results && Array.isArray(response.results)) {
                searchResults = response.results;
            } else if (response?.data?.results && Array.isArray(response.data.results)) {
                searchResults = response.data.results;
            } else if (response?.data && Array.isArray(response.data)) {
                searchResults = response.data;
            }
            
            console.log('[WebSearchPanel] Extracted results:', searchResults);
            
            setResults(searchResults);
            
            if (onResultsFound) {
                onResultsFound(searchResults);
            }

            if (searchResults.length > 0) {
                toast({
                    title: "Search Complete",
                    description: `Found ${searchResults.length} relevant results`,
                });
            } else {
                toast({
                    title: "No Results",
                    description: "No results found. Try a different query.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error('[WebSearchPanel] Search error:', error);
            toast({
                title: "Search Failed",
                description: error?.message || "Failed to perform web search. Please try again.",
                variant: "destructive",
            });
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const quickSearches = [
        { label: 'Best Practices', icon: TrendingUp, type: 'best-practices' as const },
        { label: 'Technical Specs', icon: Wrench, type: 'technical' as const },
        { label: 'Compliance', icon: Shield, type: 'compliance' as const },
    ];

    return (
        <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Globe className="h-5 w-5 text-white" />
                    </div>
                    Real-Time Web Search
                </CardTitle>
                <CardDescription>
                    Enhance your BRD with current industry standards, best practices, and technical specifications
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Quick Search Buttons */}
                <div className="flex gap-2 flex-wrap">
                    {quickSearches.map((qs) => {
                        const Icon = qs.icon;
                        return (
                            <Button
                                key={qs.type}
                                variant={searchType === qs.type ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSearchType(qs.type)}
                                className={searchType === qs.type ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg' : 'hover:border-green-500 hover:text-green-600 dark:hover:text-green-400'}
                            >
                                <Icon className="h-4 w-4 mr-2" />
                                {qs.label}
                            </Button>
                        );
                    })}
                    <Button
                        variant={searchType === 'general' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSearchType('general')}
                        className={searchType === 'general' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg' : 'hover:border-green-500 hover:text-green-600 dark:hover:text-green-400'}
                    >
                        <Search className="h-4 w-4 mr-2" />
                        General
                    </Button>
                </div>

                {/* Search Input */}
                <div className="space-y-2">
                    <Label htmlFor="search-query" className="text-sm font-medium">
                        {searchType === 'best-practices' && 'Domain or Industry'}
                        {searchType === 'technical' && 'Technology or Framework'}
                        {searchType === 'compliance' && 'Industry or Regulation'}
                        {searchType === 'general' && 'Search Query'}
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id="search-query"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={
                                searchType === 'best-practices' ? 'e.g., healthcare, fintech, e-commerce' :
                                searchType === 'technical' ? 'e.g., React, Node.js, AWS' :
                                searchType === 'compliance' ? 'e.g., GDPR, HIPAA, SOC 2' :
                                'Enter your search query...'
                            }
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="focus:ring-2 focus:ring-green-500 transition-all duration-300"
                        />
                        <Button 
                            onClick={handleSearch} 
                            disabled={isSearching}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Search className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                                    Search
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <div className="space-y-3 mt-4 animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white">Search Results ({results.length})</h4>
                            <Badge variant="secondary" className="transform hover:scale-110 transition-transform duration-300">
                                {searchType === 'general' ? 'Web' : searchType.replace('-', ' ')}
                            </Badge>
                        </div>
                        <div className="space-y-3">
                            {results.map((result, index) => (
                                <div
                                    key={index}
                                    className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer animate-fadeInUp"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h5 className="font-medium text-sm text-slate-900 dark:text-white">{result.title}</h5>
                                        {result.relevance && (
                                            <Badge variant="outline" className="text-xs transform hover:scale-110 transition-transform duration-300">
                                                {(result.relevance * 100).toFixed(0)}%
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {result.snippet}
                                    </p>
                                    {result.url && (
                                        <a
                                            href={result.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1 group"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                                            {result.url}
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {results.length === 0 && !isSearching && (
                    <div className="text-center py-12 text-muted-foreground">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                            <Globe className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                            Search the web for relevant information
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Enhance your BRD with current industry standards and best practices
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
