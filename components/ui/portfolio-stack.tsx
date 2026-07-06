import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface ProjectSpec {
	label: string;
	value: string;
}

interface Project {
	id: string;
	title: string;
	subtitle: string;
	description: string;
	image: string;
	category: string;
	specs: ProjectSpec[];
}

interface PortfolioStackProps {
	projects: Project[];
}

export function PortfolioStack({ projects }: PortfolioStackProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"]
	});

	return (
		<div ref={containerRef} className="relative w-full py-12">
			<div className="flex flex-col gap-[12vh]">
				{projects.map((project, index) => {
					return (
						<ProjectCard 
							key={project.id} 
							project={project} 
							index={index} 
							total={projects.length}
							scrollYProgress={scrollYProgress}
						/>
					);
				})}
			</div>
		</div>
	);
}

interface ProjectCardProps {
	key?: React.Key;
	project: Project;
	index: number;
	total: number;
	scrollYProgress: any;
}

function ProjectCard({ project, index, total, scrollYProgress }: ProjectCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);

	// Calculate a range of scroll progress dedicated to this specific card's transition.
	// As we scroll, previous cards should scale down slightly and dim.
	const startProgress = index / total;
	const endProgress = (index + 1) / total;

	// Scale and opacity effects for cards underneath.
	// The very last card doesn't need to scale down since nothing stacks on top of it.
	const isLast = index === total - 1;
	
	// Track scroll input inside this card's viewport range to apply subtle scaling/shadow/darkening
	const scale = useTransform(
		scrollYProgress,
		[startProgress, endProgress],
		[1, isLast ? 1 : 0.95]
	);

	const opacity = useTransform(
		scrollYProgress,
		[startProgress, endProgress],
		[1, isLast ? 1 : 0.6]
	);

	const blur = useTransform(
		scrollYProgress,
		[startProgress, endProgress],
		["0px", isLast ? "0px" : "3px"]
	);

	return (
		<div 
			ref={cardRef}
			className="sticky top-[15vh] w-full flex items-center justify-center py-4"
			style={{
				// Stagger the sticky spacing slightly so each card stacks perfectly with visible edge borders
				top: `calc(12vh + ${index * 32}px)`,
			}}
		>
			<motion.div
				style={{
					scale,
					opacity,
					filter: `blur(${blur})`,
				}}
				className="w-full max-w-5xl h-auto md:h-[480px] rounded-3xl border border-white/10 bg-neutral-950/90 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col md:flex-row group transition-all duration-300 hover:border-[#FDE047]/20"
			>
				{/* Image Container - Left side or Right side stagger based on index for architectural variety */}
				<div className={`w-full md:w-[55%] h-[240px] md:h-full relative overflow-hidden ${index % 2 === 1 ? 'md:order-last' : ''}`}>
					<img
						src={project.image}
						alt={project.title}
						className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
						referrerPolicy="no-referrer"
					/>
					{/* Dark ambient overlay with golden sparks glow at bottom */}
					<div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80" />
					<div className="absolute inset-0 bg-gradient-to-r from-neutral-950/40 to-transparent mix-blend-multiply" />
					
					{/* Category Label */}
					<span className="absolute top-5 left-5 z-10 px-3 py-1 text-[9px] font-mono uppercase tracking-[0.2em] bg-neutral-950/80 border border-white/10 text-[#FDE047] rounded-full backdrop-blur-md">
						{project.category}
					</span>
				</div>

				{/* Description & Technical details - Right/Left side */}
				<div className="w-full md:w-[45%] p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6">
					<div className="space-y-4">
						{/* Number Badge and Subtitle */}
						<div className="flex items-center gap-3">
							<span className="text-[10px] font-mono font-bold text-[#FDE047] bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
								0{index + 1}
							</span>
							<p className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
								{project.subtitle}
							</p>
						</div>

						{/* Title */}
						<h3 className="serif text-xl sm:text-2xl font-normal text-white tracking-tight group-hover:text-[#FDE047] transition-colors duration-300">
							{project.title}
						</h3>

						{/* Divider */}
						<div className="h-[1px] w-12 bg-gradient-to-r from-[#FDE047] to-transparent" />

						{/* Paragraph description */}
						<p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans font-light">
							{project.description}
						</p>
					</div>

					{/* Technical Specifications Specs row */}
					<div className="pt-4 border-t border-white/5 space-y-3">
						<p className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase font-bold">
							SYSTEM SPECIFICATIONS
						</p>
						<div className="grid grid-cols-2 gap-4">
							{project.specs.map((spec, sIdx) => (
								<div key={sIdx} className="space-y-0.5">
									<p className="text-[9px] font-mono text-neutral-400 uppercase">{spec.label}</p>
									<p className="text-xs font-semibold text-white group-hover:text-yellow-200/90 transition-colors">{spec.value}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
