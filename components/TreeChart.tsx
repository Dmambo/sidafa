
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FamilyMember } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TreeChartProps {
  data: FamilyMember;
  onNodeClick: (node: FamilyMember) => void;
}

type HierarchyNodeWithChildren = d3.HierarchyPointNode<FamilyMember> & {
  _children?: d3.HierarchyPointNode<FamilyMember>[] | null;
  x0?: number;
  y0?: number;
};

const USER_ICON_PATH = "M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z";

const TreeChart: React.FC<TreeChartProps> = ({ data, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [legendExpanded, setLegendExpanded] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || 600,
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const { width, height } = dimensions;
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
        .attr('viewBox', [0, 0, width, height])
        .style('font-family', '"Merriweather Sans", sans-serif')
        .style('user-select', 'none');

    // Create a main group for Zooming
    const g = svg.append('g');

    // Create explicit layers to control Z-Index (Painter's Algorithm)
    // 1. Marriage Links (Bottom)
    const marriageLayer = g.append('g').attr('class', 'layer-marriage');
    // 2. Tree Links
    const linkLayer = g.append('g').attr('class', 'layer-links');
    // 3. Nodes (Top)
    const nodeLayer = g.append('g').attr('class', 'layer-nodes');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });

    svg.call(zoom);

    const root = d3.hierarchy<FamilyMember>(data) as unknown as HierarchyNodeWithChildren;
    root.x0 = 0;
    root.y0 = 0;

    const treeLayout = d3.tree<FamilyMember>().nodeSize([160, 160]);

    const centerNode = (source: HierarchyNodeWithChildren) => {
        const t = d3.zoomTransform(svg.node()!);
        let x = -source.x * t.k + width / 2;
        let y = -source.y * t.k + height / 3;
        svg.transition().duration(750)
           .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(t.k));
    };

    let i = 0;
    const duration = 500;

    const update = (source: HierarchyNodeWithChildren) => {
        treeLayout(root);
        const nodes = root.descendants() as HierarchyNodeWithChildren[];
        const links = root.links();

        // ---------------------------------------------------------
        // 1. Marriage Links (Rendered in marriageLayer)
        // ---------------------------------------------------------
        const marriageLinks: { source: HierarchyNodeWithChildren; target: HierarchyNodeWithChildren }[] = [];
        const processedPairs = new Set<string>();

        nodes.forEach((node) => {
            if (node.data.spouseId) {
                const spouse = nodes.find(n => n.data.id === node.data.spouseId);
                if (spouse) {
                    const pairKey = [node.data.id, spouse.data.id].sort().join('-');
                    if (!processedPairs.has(pairKey)) {
                        marriageLinks.push({ source: node, target: spouse });
                        processedPairs.add(pairKey);
                    }
                }
            }
        });

        const mLink = marriageLayer.selectAll<SVGPathElement, any>('path.marriage-link')
            .data(marriageLinks, (d) => `${d.source.data.id}-${d.target.data.id}`);

        mLink.enter().append('path')
            .attr('class', 'marriage-link')
            .attr('d', (d) => {
                const o = { x: source.x0 || 0, y: source.y0 || 0 };
                return `M ${o.x} ${o.y} Q ${o.x} ${o.y} ${o.x} ${o.y}`;
            })
            .style('fill', 'none')
            .style('stroke', '#d4af37') // Gold
            .style('stroke-width', '2px')
            .style('stroke-dasharray', '4, 4')
            .style('opacity', 0)
            .transition().duration(duration)
            .style('opacity', 1)
            .attr('d', (d) => {
                const s = d.source;
                const t = d.target;
                const dist = Math.abs(t.x - s.x);
                // Curve downwards significantly to avoid crossing the node image directly
                const arcHeight = Math.max(60, dist * 0.2); 
                const midX = (s.x + t.x) / 2;
                const midY = Math.min(s.y, t.y) - arcHeight; // Negative goes UP in SVG? No, y increases downwards. 
                // Wait, in D3 Tree, usually Root is at (x,y). If vertical, y increases down.
                // If we want the arc to go "under" visually if the tree is top-down? 
                // Actually usually arcs look better curving "up" (lower Y value) or "down" (higher Y value).
                // Let's curve 'down' (higher Y) to wrap below the nodes? Or Up? 
                // Let's stick to the previous logic but ensure layer order handles overlap.
                
                return `M ${s.x} ${s.y} Q ${midX} ${midY} ${t.x} ${t.y}`;
            });
            
        mLink.exit().transition().duration(duration).style('opacity', 0).remove();


        // ---------------------------------------------------------
        // 2. Standard Links (Rendered in linkLayer)
        // ---------------------------------------------------------
        const link = linkLayer.selectAll<SVGPathElement, d3.HierarchyLink<FamilyMember>>('path.link')
            .data(links, (d: any) => d.target.id);

        const linkEnter = link.enter().append('path')
            .attr('class', 'link')
            .attr('d', (d) => {
                const o = { x: source.x0 || 0, y: source.y0 || 0 };
                return diagonal(o, o);
            })
            .style('fill', 'none')
            .style('stroke', '#a8a29e') // Stone/Grey
            .style('stroke-width', '1.5px');

        linkEnter.merge(link).transition().duration(duration)
            .attr('d', (d) => diagonal(d.source, d.target));

        link.exit().transition().duration(duration)
            .attr('d', (d) => {
                const o = { x: source.x, y: source.y };
                return diagonal(o, o);
            })
            .remove();

        // ---------------------------------------------------------
        // 3. Nodes (Rendered in nodeLayer)
        // ---------------------------------------------------------
        const node = nodeLayer.selectAll<SVGGElement, HierarchyNodeWithChildren>('g.node')
            .data(nodes, (d) => d.data.id || (d.data.id = `node-${++i}`));

        const nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', (d) => `translate(${source.x0 || 0},${source.y0 || 0})`)
            .on('click', (event, d) => {
                event.stopPropagation();
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);
                centerNode(d);
            });

        // Circle
        nodeEnter.append('circle')
            .attr('class', 'node-circle')
            .attr('r', 1e-6)
            .style('fill', (d) => {
                if (d.data.relationship === 'root') return '#163c2c'; 
                if (d.data.relationship === 'spouse') return '#b4942b'; 
                return d._children ? '#f5eadb' : '#fff';
            })
            .style('stroke', (d) => {
                 if (d.data.relationship === 'root') return '#0f291e';
                 if (d.data.relationship === 'spouse') return '#917622';
                 return d._children ? '#163c2c' : '#78716c';
            })
            .style('stroke-width', '2px');

        const contentGroup = nodeEnter.append('g').attr('class', 'node-content');

        // Text label
        nodeEnter.append('text')
            .attr('dy', '.35em')
            .attr('y', 35) 
            .attr('text-anchor', 'middle')
            .text((d) => {
              // Truncate long names on mobile
              const name = d.data.name;
              return name.length > 15 ? name.substring(0, 12) + '...' : name;
            })
            .style('fill-opacity', 1e-6)
            .style('font-weight', '600')
            .style('font-size', '11px')
            .style('cursor', 'pointer')
            .style('fill', '#1c1917')
            .style('text-shadow', '0 1px 2px rgba(255,255,255,0.8)')
            .attr('class', 'node-label')
            .on('click', (event, d) => {
                event.stopPropagation();
                onNodeClick(d.data);
                centerNode(d);
            });
            
        const nodeUpdate = nodeEnter.merge(node);

        nodeUpdate.transition().duration(duration)
            .attr('transform', (d) => `translate(${d.x},${d.y})`);

        nodeUpdate.select('circle.node-circle')
            .attr('r', 24)
            .style('fill', (d) => {
                if (d.data.relationship === 'root') return '#163c2c'; 
                if (d.data.relationship === 'spouse') return '#b4942b'; 
                return d._children ? '#f5eadb' : '#fff';
            })
            .style('stroke', (d) => {
                if (d.data.relationship === 'root') return '#0f291e';
                if (d.data.relationship === 'spouse') return '#917622';
                return d._children ? '#163c2c' : '#a8a29e';
            })
            .attr('cursor', 'pointer');
        
        nodeUpdate.select('.node-content').each(function(d) {
            const gContent = d3.select(this);
            gContent.selectAll('*').remove();

            if (d.data.photoUrl) {
                // Add clip path for the image
                gContent.append('defs')
                    .append('clipPath')
                    .attr('id', `clip-${d.data.id}`)
                    .append('circle')
                    .attr('r', 24);
                
                // Image content
                gContent.append('image')
                    .attr('href', d.data.photoUrl)
                    .attr('x', -24)
                    .attr('y', -24)
                    .attr('width', 48)
                    .attr('height', 48)
                    .attr('clip-path', `url(#clip-${d.data.id})`)
                    .attr('preserveAspectRatio', 'xMidYMid slice')
                    .style('pointer-events', 'none');
            } else {
                const isDark = d.data.relationship === 'root' || d.data.relationship === 'spouse';
                const iconColor = isDark ? '#fdfbf7' : '#a8a29e';

                gContent.append('path')
                    .attr('d', USER_ICON_PATH)
                    .attr('transform', 'translate(-12, -12) scale(1)')
                    .attr('fill', iconColor)
                    .style('pointer-events', 'none');
            }
        });

        nodeUpdate.select('text').style('fill-opacity', 1);

        const nodeExit = node.exit().transition().duration(duration)
            .attr('transform', (d) => `translate(${source.x},${source.y})`)
            .remove();

        nodeExit.select('circle').attr('r', 1e-6);
        nodeExit.select('text').style('fill-opacity', 1e-6);

        nodes.forEach((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    };

    const diagonal = (s: any, d: any) => {
        return `M ${s.x} ${s.y}
                C ${s.x} ${(s.y + d.y) / 2},
                  ${d.x} ${(s.y + d.y) / 2},
                  ${d.x} ${d.y}`;
    };

    const initialY = 80;
    const initialX = width / 2;
    // Initial Zoom
    svg.call(zoom.transform, d3.zoomIdentity.translate(initialX, initialY).scale(0.85));
    update(root);

  }, [data, dimensions, onNodeClick]); 

  return (
    <div ref={containerRef} className="w-full h-full min-h-[600px] bg-white relative overflow-hidden rounded-xl border border-slate-200 shadow-inner">
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"></svg>
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white/90 rounded-lg shadow-xl text-[10px] sm:text-xs text-slate-500 border border-cream-200 backdrop-blur-sm max-w-[140px] sm:max-w-none overflow-hidden">
        <button
          onClick={() => setLegendExpanded(!legendExpanded)}
          className="w-full flex items-center justify-between p-2 sm:p-3 md:p-4 hover:bg-cream-50 transition-colors pointer-events-auto cursor-pointer"
          aria-label={legendExpanded ? 'Collapse legend' : 'Expand legend'}
        >
          <h4 className="font-serif font-bold text-heritage-900 text-xs sm:text-sm">Legend</h4>
          {legendExpanded ? (
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
          ) : (
            <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
          )}
        </button>
        {legendExpanded && (
          <div className="px-2 sm:px-3 md:px-4 pb-2 sm:pb-3 md:pb-4 pointer-events-none">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-heritage-800 border border-heritage-900 flex-shrink-0"></span> <span className="text-[10px] sm:text-xs">Patriarch</span></div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gold-500 border border-gold-600 flex-shrink-0"></span> <span className="text-[10px] sm:text-xs">Branch Matriarch</span></div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white border border-slate-300 flex-shrink-0"></span> <span className="text-[10px] sm:text-xs">Member</span></div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2"><span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-cream-200 border-2 border-heritage-800 flex-shrink-0"></span> <span className="text-[10px] sm:text-xs">Collapsed Branch</span></div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1"><span className="w-6 sm:w-8 h-0.5 border-b-2 border-dashed border-gold-500 flex-shrink-0"></span> <span className="text-[10px] sm:text-xs">Linked Spouse</span></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeChart;
