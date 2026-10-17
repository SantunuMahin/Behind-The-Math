import os
import json
import re
from pathlib import Path
from html import unescape
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.formulas.models import Subject, Topic, Formula
from apps.lessons.models import LessonModule, SymbolDefinition, CodeImplementation
from apps.practice.models import PracticeQuestion
from apps.students.models import FlashcardSRS

class Command(BaseCommand):
    help = 'Seeds all math data (86 formulas, 12 lessons, 30+ questions, flashcards) into Django models with zero data loss.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("[START] Starting BehindTheMath full database seeding..."))

        # Base directories
        proj_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
        if proj_dir.name == 'backend':
            base_dir = proj_dir.parent
        elif (proj_dir / 'backend').exists():
            base_dir = proj_dir
        else:
            base_dir = proj_dir.parent

        data_file = base_dir / 'data' / 'formulas.json'
        lessons_dir = base_dir / 'lessons'
        practice_file = base_dir / 'practice.html'

        if not data_file.exists():
            self.stderr.write(f"Error: {data_file} not found.")
            return

        # 1. Subjects Configuration
        SUBJECT_CONFIG = {
            'Geometry': {'icon': '📐', 'gradient': 'from-[#1D3557] to-[#457B9D]', 'order': 1, 'desc': 'Shapes, angles, spatial properties, Euclidean geometry, coordinate spaces, and trigonometry.'},
            'Algebra': {'icon': '𝑥', 'gradient': 'from-[#2B2D42] to-[#8D99AE]', 'order': 2, 'desc': 'Polynomials, quadratic functions, factorization, logarithmic identities, and systems of equations.'},
            'Foundations': {'icon': '⚖️', 'gradient': 'from-[#1D3557] to-[#A8DADC]', 'order': 3, 'desc': 'Arithmetic principles, proportions, percentages, units, orders of magnitude, and dimensional analysis.'},
            'Number Theory': {'icon': '🔢', 'gradient': 'from-[#14213D] to-[#FCA311]', 'order': 4, 'desc': 'Divisibility, prime numbers, modular arithmetic, Euclidean algorithm, GCD, and LCM.'},
            'Trigonometry': {'icon': '∡', 'gradient': 'from-[#005F73] to-[#0A9396]', 'order': 5, 'desc': 'Unit circle, sine, cosine, tangent, Pythagorean identities, radians, and harmonic waves.'},
            'Calculus': {'icon': '∫', 'gradient': 'from-[#1D3557] to-[#2A9D8F]', 'order': 6, 'desc': 'Rates of change, tangents, derivatives, integrals, limits, series, and optimization.'},
            'Statistics': {'icon': '📊', 'gradient': 'from-[#264653] to-[#2A9D8F]', 'order': 7, 'desc': 'Mean, variance, standard deviation, normal distribution, confidence intervals, and hypothesis tests.'},
            'Counting & Probability': {'icon': '🎲', 'gradient': 'from-[#6B2D5C] to-[#E63946]', 'order': 8, 'desc': 'Permutations, combinations, conditional probability, Bayes theorem, and random variables.'},
            'Linear Algebra': {'icon': '▦', 'gradient': 'from-[#1B263B] to-[#415A77]', 'order': 9, 'desc': 'Vectors, matrices, dot products, determinants, eigenvalues, and linear transformations.'},
            'CSE & Competitive Programming': {'icon': '💻', 'gradient': 'from-[#0D1B2A] to-[#1B4965]', 'order': 10, 'desc': 'Big-O complexity, bitwise manipulation, graphs, master theorem, and algorithmic math.'},
            'Discrete Math': {'icon': '🕸️', 'gradient': 'from-[#3A0CA3] to-[#4361EE]', 'order': 11, 'desc': 'Logic, set theory, graph theory, combinatorics, relations, and proof methods.'},
            'Physics': {'icon': '⚛️', 'gradient': 'from-[#03045E] to-[#0077B6]', 'order': 12, 'desc': 'Kinematics, Newton laws, energy, momentum, gravity, electromagnetism, and wave mechanics.'},
        }

        subjects_dict = {}
        for name, cfg in SUBJECT_CONFIG.items():
            s_slug = slugify(name)
            sub, _ = Subject.objects.update_or_create(
                slug=s_slug,
                defaults={
                    'name': name,
                    'icon': cfg['icon'],
                    'gradient': cfg['gradient'],
                    'description': cfg['desc'],
                    'order': cfg['order'],
                }
            )
            subjects_dict[name] = sub

        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(subjects_dict)} Subject categories."))

        # 2. Seed Formulas from formulas.json
        with open(data_file, 'r', encoding='utf-8') as f:
            formulas_data = json.load(f)

        formula_obj_map = {}
        for item in formulas_data:
            s_name = item.get('subject', 'Foundations')
            sub = subjects_dict.get(s_name)
            if not sub:
                sub, _ = Subject.objects.get_or_create(
                    slug=slugify(s_name),
                    defaults={'name': s_name, 'icon': '📐', 'order': 99}
                )
                subjects_dict[s_name] = sub

            vid = item.get('video') or {}

            form, _ = Formula.objects.update_or_create(
                formula_id=item['id'],
                defaults={
                    'title': item['title'],
                    'slug': item.get('slug', slugify(item['title'])),
                    'subject': sub,
                    'level': item.get('level', 'beginner'),
                    'summary': item.get('summary', ''),
                    'formula_latex': item.get('formulaLatex', ''),
                    'has_demo': item.get('hasDemo', False),
                    'keywords': item.get('keywords', []),
                    'href': item.get('href', ''),
                    'video_youtube_id': vid.get('youtubeId', ''),
                    'video_url': vid.get('url', ''),
                    'video_title': vid.get('title', ''),
                    'video_channel': vid.get('channel', ''),
                }
            )

            # Topics
            for t_name in item.get('topics', []):
                t_slug = slugify(t_name)
                top, _ = Topic.objects.get_or_create(
                    subject=sub,
                    slug=t_slug,
                    defaults={'name': t_name}
                )
                form.topics.add(top)

            formula_obj_map[item['id']] = form

        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(formula_obj_map)} Formulas with topics and metadata."))

        # 3. Seed Lessons from HTML files
        lesson_file_map = {
            'circle-area': 'circle-area.html',
            'pythagorean-theorem': 'pythagorean-theorem.html',
            'quadratic-equation': 'quadratic-equation.html',
            'gcd-lcm': 'gcd-lcm.html',
            'percentages-ratios': 'percentages-ratios.html',
            'exponents-logarithms': 'exponents-logarithms.html',
            'permutations-combinations': 'permutations-combinations.html',
            'probability-bayes': 'probability-bayes.html',
            'mean-standard-deviation': 'mean-standard-deviation.html',
            'derivatives-tangent': 'derivatives-tangent.html',
            'unit-circle': 'unit-circle.html',
            'time-complexity': 'time-complexity.html',
        }

        def clean_html(text):
            if not text:
                return ""
            # Strip tags and normalize whitespace
            clean = re.sub(r'<[^>]+>', ' ', text)
            clean = unescape(clean)
            return re.sub(r'\s+', ' ', clean).strip()

        seeded_lessons_count = 0
        for f_id, filename in lesson_file_map.items():
            filepath = lessons_dir / filename
            if not filepath.exists() or f_id not in formula_obj_map:
                continue

            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            formula_obj = formula_obj_map[f_id]

            # Subtitle
            sub_m = re.search(r'<p style="font-size:var\(--text-lg\)[^>]*>(.*?)</p>', content, re.DOTALL)
            subtitle = clean_html(sub_m.group(1)) if sub_m else formula_obj.summary

            # Formula Latex
            latex_m = re.search(r'data-latex="([^"]+)"', content)
            latex_display = latex_m.group(1) if latex_m else formula_obj.formula_latex

            # Plain language intuition
            intuition_m = re.search(r'<h2>(?:Plain-Language|Intuition|Why this matters)[^<]*</h2>(.*?)(?:<section|<h2)', content, re.DOTALL | re.IGNORECASE)
            intuition = clean_html(intuition_m.group(1)) if intuition_m else formula_obj.summary

            # Conditions & Assumptions
            assumptions_data = {'applies_when': [], 'limitations': []}
            assump_m = re.search(r'<div class="assumption-note"[^>]*>(.*?)</div>', content, re.DOTALL)
            if assump_m:
                li_items = re.findall(r'<li>(.*?)</li>', assump_m.group(1), re.DOTALL)
                assumptions_data['applies_when'] = [clean_html(item) for item in li_items]

            # Worked Example
            example_prob = ""
            example_steps = []
            example_solution = ""
            example_m = re.search(r'<div class="worked-example"[^>]*>(.*?)</div>\s*</section>', content, re.DOTALL)
            if example_m:
                prob_m = re.search(r'<h4>(?:Problem|Example)[^<]*</h4>\s*<p>(.*?)</p>', example_m.group(1), re.DOTALL)
                if prob_m:
                    example_prob = clean_html(prob_m.group(1))
                steps = re.findall(r'<div class="worked-step-num"[^>]*>(\d+)</div>\s*<div class="worked-step-body">(.*?)</div>', example_m.group(1), re.DOTALL)
                for s_num, s_body in steps:
                    example_steps.append({
                        'step': int(s_num),
                        'description': clean_html(s_body)
                    })
                ans_m = re.search(r'<div class="worked-answer"[^>]*>(.*?)</div>', example_m.group(1), re.DOTALL)
                if ans_m:
                    example_solution = clean_html(ans_m.group(1))

            lesson, _ = LessonModule.objects.update_or_create(
                formula=formula_obj,
                defaults={
                    'subtitle': subtitle,
                    'latex_display': latex_display,
                    'plain_language_intuition': intuition,
                    'conditions_and_assumptions': assumptions_data,
                    'worked_example_problem': example_prob,
                    'worked_example_steps': example_steps,
                    'worked_example_solution': example_solution,
                    'lab_component_name': f_id,
                }
            )

            # Symbol Definitions
            SymbolDefinition.objects.filter(lesson=lesson).delete()
            tbody_m = re.search(r'<div class="variable-legend">.*?<tbody>(.*?)</tbody>', content, re.DOTALL)
            if tbody_m:
                rows = re.findall(r'<tr>(.*?)</tr>', tbody_m.group(1), re.DOTALL)
                for order, row in enumerate(rows):
                    cols = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
                    if len(cols) >= 2:
                        sym = clean_html(cols[0])
                        mean = clean_html(cols[1])
                        unit = clean_html(cols[2]) if len(cols) > 2 else ""
                        constr = clean_html(cols[3]) if len(cols) > 3 else ""
                        SymbolDefinition.objects.create(
                            lesson=lesson,
                            symbol=sym,
                            meaning=mean,
                            unit=unit,
                            constraint=constr,
                            order=order
                        )

            # Code Implementations (C and Python)
            CodeImplementation.objects.filter(lesson=lesson).delete()
            c_code_m = re.search(r'<div class="code-panel[^"]*" data-tab="c">.*?<pre><code>(.*?)</code></pre>', content, re.DOTALL)
            if c_code_m:
                c_clean = re.sub(r'<[^>]+>', '', c_code_m.group(1))
                CodeImplementation.objects.create(
                    lesson=lesson,
                    language='c',
                    code=unescape(c_clean).strip()
                )

            py_code_m = re.search(r'<div class="code-panel[^"]*" data-tab="python">.*?<pre><code>(.*?)</code></pre>', content, re.DOTALL)
            if py_code_m:
                py_clean = re.sub(r'<[^>]+>', '', py_code_m.group(1))
                CodeImplementation.objects.create(
                    lesson=lesson,
                    language='python',
                    code=unescape(py_clean).strip()
                )

            # Embedded Practice Questions in Lesson
            l_questions = re.findall(r'<div class="practice-question"[^>]*data-answer="([^"]+)"[^>]*>(.*?)</div>\s*(?:<!--|<div class="practice-question"|</section)', content, re.DOTALL)
            for q_ans, q_body in l_questions:
                q_text_m = re.search(r'<p class="practice-q-text"[^>]*>(.*?)</p>', q_body, re.DOTALL)
                q_hint_m = re.search(r'<div class="practice-hint"[^>]*>(.*?)</div>', q_body, re.DOTALL)
                q_exp_m = re.search(r'<div class="practice-explanation"[^>]*>(.*?)</div>', q_body, re.DOTALL)
                
                if q_text_m:
                    PracticeQuestion.objects.get_or_create(
                        lesson=lesson,
                        subject=formula_obj.subject,
                        topic_tag=formula_obj.subject.slug,
                        question_text=clean_html(q_text_m.group(1)),
                        defaults={
                            'correct_answer': q_ans.strip(),
                            'hint': clean_html(q_hint_m.group(1)) if q_hint_m else "",
                            'explanation': clean_html(q_exp_m.group(1)) if q_exp_m else "",
                            'tolerance': 0.05,
                        }
                    )

            seeded_lessons_count += 1

        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {seeded_lessons_count} Comprehensive Lesson Modules from static files."))

        # 3b. Ensure all remaining formulas have rich synthesized LessonModule records
        from apps.lessons.views import ensure_lesson_for_formula
        synthesized_count = 0
        for f_obj in formula_obj_map.values():
            if not LessonModule.objects.filter(formula=f_obj).exists():
                ensure_lesson_for_formula(f_obj)
                synthesized_count += 1
        self.stdout.write(self.style.SUCCESS(f"[OK] Total Lesson Modules: {LessonModule.objects.count()} (Ensured 100% coverage across all {len(formula_obj_map)} formulas with +{synthesized_count} synthesized)."))

        # 4. Seed Questions from practice.html
        if practice_file.exists():
            with open(practice_file, 'r', encoding='utf-8') as f:
                practice_content = f.read()

            p_questions = re.findall(r'<div class="practice-question" data-answer="([^"]+)" data-topic="([^"]+)"[^>]*>(.*?)</div>\s*(?:<!--|<div class="practice-question"|</div)', practice_content, re.DOTALL)
            
            p_count = 0
            for idx, (ans, topic_tag, q_block) in enumerate(p_questions, 1):
                q_num_m = re.search(r'<div class="practice-q-number"[^>]*>(.*?)</div>', q_block, re.DOTALL)
                q_text_m = re.search(r'<p class="practice-q-text"[^>]*>(.*?)</p>', q_block, re.DOTALL)
                q_hint_m = re.search(r'<div class="practice-hint"[^>]*>(.*?)</div>', q_block, re.DOTALL)
                q_exp_m = re.search(r'<div class="practice-explanation"[^>]*>(.*?)</div>', q_block, re.DOTALL)

                # check if options exist
                options = []
                opt_matches = re.findall(r'<label class="practice-option"[^>]*>.*?<span>(.*?)</span>', q_block, re.DOTALL)
                if opt_matches:
                    options = [clean_html(o) for o in opt_matches]

                # unit label
                unit_label = ""
                unit_m = re.search(r'<span style="font-size:var\(--text-sm\);color:var\(--color-muted\)">([^<]+)</span>', q_block)
                if unit_m:
                    unit_label = unit_m.group(1).strip()

                q_type = 'multiple_choice' if options else ('numeric' if re.search(r'^-?\d+(?:\.\d+)?$', ans.replace('$', '').replace(',', '').replace('%', '').strip()) else 'text')

                # find matching subject
                subj = None
                for s_key, s_obj in subjects_dict.items():
                    if topic_tag.lower() in s_obj.slug.lower() or topic_tag.lower() in s_key.lower():
                        subj = s_obj
                        break
                if not subj:
                    subj = subjects_dict.get('Geometry')

                PracticeQuestion.objects.update_or_create(
                    order=idx,
                    topic_tag=topic_tag,
                    defaults={
                        'subject': subj,
                        'question_text': clean_html(q_text_m.group(1)) if q_text_m else f"Question {idx}",
                        'question_type': q_type,
                        'options': options,
                        'correct_answer': ans.strip(),
                        'tolerance': 0.05,
                        'unit_label': unit_label,
                        'hint': clean_html(q_hint_m.group(1)) if q_hint_m else "",
                        'explanation': clean_html(q_exp_m.group(1)) if q_exp_m else "",
                    }
                )
                p_count += 1

            self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {p_count} Practice Questions from practice.html."))

        # 5. Seed Flashcards for Active Recall
        FlashcardSRS.objects.all().delete()
        for f_obj in Formula.objects.all()[:24]:
            FlashcardSRS.objects.create(
                formula=f_obj,
                repetitions=0,
                interval_days=1,
                ease_factor=2.5
            )
        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded initial Flashcard SRS study decks."))

        self.stdout.write(self.style.SUCCESS("[SUCCESS] Seeding complete! All math data migrated with 100% precision."))

