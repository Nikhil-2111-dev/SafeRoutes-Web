import sys
import re

with open(r'c:\SafeRoute\frontend\src\components\MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { Search, Navigation2, Plus, Minus, MapPin, X, LocateFixed, Route, PanelRightClose, PanelRightOpen, ArrowRight, Zap, ShieldCheck, Scale, Clock } from 'lucide-react';",
    "import { Search, Navigation2, Plus, Minus, MapPin, X, LocateFixed, Route, PanelRightClose, PanelRightOpen, ArrowRight, Zap, ShieldCheck, Scale, Clock } from 'lucide-react';\nimport { usePOIs } from '../hooks/usePOIs';\nimport { loadPOIIcons } from '../utils/poiIcons';"
)

# 2. State replacements
old_states = '''  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pois, setPois] = useState<any[]>([]);
  const [showPOIs, setShowPOIs] = useState(true);
  const [isFetchingPOIs, setIsFetchingPOIs] = useState(false);'''

new_states = '''  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showPOIs, setShowPOIs] = useState(true);
  const { poiGeoJson, isFetchingPOIs } = usePOIs(mapRef, showPOIs);
  const [hoveredPoi, setHoveredPoi] = useState<{ id: string, name: string, x: number, y: number } | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<{ id: string, name: string, category: string, lat: number, lon: number } | null>(null);'''

content = content.replace(old_states, new_states)

# 3. Layer IDs
old_layers = '''  const interactiveLayerIds = useMemo(() => {
    return [...routeOptions.map(r => `route-line-${r.id}`), 'unclustered-point'];
  }, [routeOptions]);'''

new_layers = '''  const interactiveLayerIds = useMemo(() => {
    return [...routeOptions.map(r => `route-line-${r.id}`), 'unclustered-point', 'poi-unclustered'];
  }, [routeOptions]);'''

content = content.replace(old_layers, new_layers)

with open(r'c:\SafeRoute\frontend\src\components\MapComponent.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done initial replacements.')
