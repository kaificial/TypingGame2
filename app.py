from flask import Flask, render_template, jsonify, request
import random
import json
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any

app = Flask(__name__)




COMMON_WORDS = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 
    'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 
    'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 
    'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 
    'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 
    'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 
    'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 
    'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
]

TECH_WORDS = [
    'algorithm', 'database', 'function', 'variable', 'class', 'object', 'method', 'interface', 
    'protocol', 'framework', 'library', 'module', 'package', 'dependency', 'configuration', 
    'deployment', 'server', 'client', 'network', 'encryption', 'authentication', 'authorization', 
    'session', 'cache', 'memory', 'processor', 'storage', 'bandwidth', 'latency', 'scalability', 
    'performance', 'optimization', 'debugging', 'testing', 'integration', 'monitoring', 'logging', 
    'analytics', 'machine', 'learning', 'artificial', 'intelligence', 'neural', 'data', 'science', 
    'statistics', 'probability', 'cloud', 'virtualization', 'container', 'microservice', 'api', 
    'rest', 'graphql', 'websocket', 'http', 'https'
]

PROGRAMMING_WORDS = [
    'function', 'variable', 'constant', 'array', 'object', 'class', 'method', 'property', 
    'parameter', 'argument', 'return', 'void', 'null', 'undefined', 'boolean', 'integer', 
    'float', 'string', 'character', 'pointer', 'loop', 'condition', 'statement', 'expression', 
    'operator', 'assignment', 'comparison', 'logical', 'bitwise', 'arithmetic', 'scope', 
    'namespace', 'module', 'import', 'export', 'require', 'include', 'extend', 'implement', 
    'inherit', 'override', 'overload', 'polymorphism', 'encapsulation', 'abstraction', 
    'inheritance', 'composition', 'aggregation', 'association', 'dependency'
]


class ContentGenerator:
    """Handles content generation for typing tests"""
    
    @staticmethod
    def generate_random_sentence(min_words: int = 5, max_words: int = 20, word_list: Optional[List[str]] = None) -> str:
        """Generate a random sentence with proper capitalization and punctuation"""
        if word_list is None:
            word_list = COMMON_WORDS
        
        word_count = random.randint(min_words, max_words)
        words = random.choices(word_list, k=word_count)
        words[0] = words[0].capitalize()
        
        sentence_types = [
            lambda w: ' '.join(w) + '.',
            lambda w: ' '.join(w) + '!',
            lambda w: ' '.join(w) + '?',
            lambda w: ' '.join(w) + '...',
        ]
        
        sentence_generator = random.choice(sentence_types)
        return sentence_generator(words)

    @staticmethod
    def generate_random_paragraph(num_sentences: int = 3, word_list: Optional[List[str]] = None) -> str:
        """Generate a random paragraph with multiple sentences"""
        sentences = []
        for _ in range(num_sentences):
            sentences.append(ContentGenerator.generate_random_sentence(word_list=word_list))
        return ' '.join(sentences)

    @staticmethod
    def generate_random_code_snippet(language: str = 'python', complexity: str = 'medium') -> str:
        """Generate random code snippets with random variable names and logic"""
        
        var_names = [
            'data', 'result', 'value', 'item', 'element', 'object', 'array', 'list', 'dict', 'set',
            'count', 'index', 'position', 'length', 'size', 'total', 'sum', 'average', 'maximum', 'minimum',
            'user', 'name', 'email', 'password', 'token', 'session', 'config', 'settings', 'options', 'params',
            'temp', 'current', 'previous', 'next', 'first', 'last', 'start', 'end', 'begin', 'finish'
        ]
        
        func_names = [
            'process', 'calculate', 'compute', 'generate', 'create', 'build', 'construct', 'initialize', 'setup', 'configure',
            'validate', 'check', 'verify', 'test', 'analyze', 'parse', 'format', 'transform', 'convert', 'extract',
            'filter', 'sort', 'search', 'find', 'locate', 'get', 'fetch', 'retrieve', 'load', 'save'
        ]
        
        if language == 'python':
            templates = [
                f'''def {random.choice(func_names)}({random.choice(var_names)}):
    {random.choice(var_names)} = []
    for {random.choice(var_names)} in {random.choice(var_names)}:
        if {random.choice(var_names)} > 0:
            {random.choice(var_names)}.append({random.choice(var_names)})
    return {random.choice(var_names)}''',
                
                f'''class {random.choice(var_names).capitalize()}:
    def __init__(self, {random.choice(var_names)}):
        self.{random.choice(var_names)} = {random.choice(var_names)}
    
    def {random.choice(func_names)}(self):
        return self.{random.choice(var_names)} * 2''',
                
                f'''{random.choice(var_names)} = {{}}
for {random.choice(var_names)} in range(10):
    {random.choice(var_names)}[{random.choice(var_names)}] = {random.choice(var_names)} * {random.choice(var_names)}''',
                
                f'''def {random.choice(func_names)}({random.choice(var_names)}, {random.choice(var_names)}):
    try:
        {random.choice(var_names)} = {random.choice(var_names)} / {random.choice(var_names)}
        return {random.choice(var_names)}
    except Exception as {random.choice(var_names)}:
        return None'''
            ]
        
        elif language == 'javascript':
            templates = [
                f'''const {random.choice(var_names)} = ({random.choice(var_names)}) => {{
    const {random.choice(var_names)} = [];
    for (let {random.choice(var_names)} = 0; {random.choice(var_names)} < {random.choice(var_names)}.length; {random.choice(var_names)}++) {{
        {random.choice(var_names)}.push({random.choice(var_names)}[{random.choice(var_names)}]);
    }}
    return {random.choice(var_names)};
}};''',
                
                f'''class {random.choice(var_names).capitalize()} {{
    constructor({random.choice(var_names)}) {{
        this.{random.choice(var_names)} = {random.choice(var_names)};
    }}
    
    {random.choice(func_names)}() {{
        return this.{random.choice(var_names)} * 2;
    }}
}}''',
                
                f'''const {random.choice(var_names)} = new Map();
{random.choice(var_names)}.forEach(({random.choice(var_names)}, {random.choice(var_names)}) => {{
    {random.choice(var_names)}.set({random.choice(var_names)}, {random.choice(var_names)});
}});''',
                
                f'''async function {random.choice(func_names)}({random.choice(var_names)}) {{
    try {{
        const {random.choice(var_names)} = await fetch({random.choice(var_names)});
        return await {random.choice(var_names)}.json();
    }} catch ({random.choice(var_names)}) {{
        console.error({random.choice(var_names)});
        return null;
    }}
}}'''
            ]
        
        elif language == 'java':
            templates = [
                f'''public class {random.choice(var_names).capitalize()} {{
    private List<Integer> {random.choice(var_names)};
    
    public {random.choice(var_names).capitalize()}() {{
        this.{random.choice(var_names)} = new ArrayList<>();
    }}
    
    public void {random.choice(func_names)}(List<Integer> {random.choice(var_names)}) {{
        for (Integer {random.choice(var_names)} : {random.choice(var_names)}) {{
            if ({random.choice(var_names)} > 0) {{
                this.{random.choice(var_names)}.add({random.choice(var_names)});
            }}
        }}
    }}
    
    public List<Integer> get{random.choice(var_names).capitalize()}() {{
        return new ArrayList<>(this.{random.choice(var_names)});
    }}
}}''',
                
                f'''public class {random.choice(var_names).capitalize()} {{
    private String {random.choice(var_names)};
    private int {random.choice(var_names)};
    
    public {random.choice(var_names).capitalize()}(String {random.choice(var_names)}) {{
        this.{random.choice(var_names)} = {random.choice(var_names)};
        this.{random.choice(var_names)} = 0;
    }}
    
    public String {random.choice(func_names)}() {{
        return this.{random.choice(var_names)} + " - " + this.{random.choice(var_names)};
    }}
}}''',
                
                f'''Map<String, Integer> {random.choice(var_names)} = new HashMap<>();
for (int {random.choice(var_names)} = 0; {random.choice(var_names)} < 10; {random.choice(var_names)}++) {{
    {random.choice(var_names)}.put("key" + {random.choice(var_names)}, {random.choice(var_names)} * 2);
}}''',
                
                f'''public Optional<String> {random.choice(func_names)}(String {random.choice(var_names)}) {{
    try {{
        if ({random.choice(var_names)} != null && !{random.choice(var_names)}.isEmpty()) {{
            return Optional.of({random.choice(var_names)}.toUpperCase());
        }}
        return Optional.empty();
    }} catch (Exception {random.choice(var_names)}) {{
        System.err.println("Error: " + {random.choice(var_names)}.getMessage());
        return Optional.empty();
    }}
}}'''
            ]
        
        else:
            templates = [f'''def {random.choice(func_names)}({random.choice(var_names)}):
    return {random.choice(var_names)} * 2''']
        
        return random.choice(templates)





# Content collections
TEXT_COLLECTIONS = {
    'philosophy': [
        "The unexamined life is not worth living. Socrates believed that philosophical inquiry and self-reflection are essential for a meaningful human existence.",
        "Cogito ergo sum, I think therefore I am. This famous philosophical statement by René Descartes establishes the existence of the self as the foundation of all knowledge.",
        "Happiness is not something ready-made. It comes from your own actions. The Dalai Lama teaches that true happiness arises from cultivating positive mental states and compassionate behavior.",
        "The only true wisdom is in knowing you know nothing. This Socratic paradox emphasizes the importance of intellectual humility and continuous learning.",
        "Man is born free, and everywhere he is in chains. Jean-Jacques Rousseau's famous opening line from The Social Contract explores the tension between individual liberty and social organization."
    ],
    'science': [
        "Quantum mechanics describes the behavior of matter and energy at the atomic and subatomic level. The uncertainty principle states that we cannot simultaneously know both the position and momentum of a particle.",
        "Evolution by natural selection is the process by which organisms better adapted to their environment tend to survive and produce more offspring. This fundamental mechanism drives the diversity of life on Earth.",
        "The theory of relativity consists of two interrelated theories by Albert Einstein. Special relativity applies to all physical phenomena in the absence of gravity, while general relativity explains the law of gravitation.",
        "DNA contains the genetic instructions for the development and functioning of living organisms. The double helix structure was discovered by James Watson and Francis Crick in 1953.",
        "Climate change refers to long-term shifts in global weather patterns and average temperatures. Human activities, particularly the burning of fossil fuels, have significantly contributed to recent warming trends."
    ],
    'tech': [
        "Artificial intelligence is transforming industries across the globe. Machine learning algorithms can now process vast amounts of data to identify patterns and make predictions with remarkable accuracy.",
        "Blockchain technology provides a decentralized and secure way to record transactions. Each block contains a cryptographic hash of the previous block, creating an immutable chain of data.",
        "Cloud computing enables businesses to scale their infrastructure dynamically. Services like AWS, Azure, and Google Cloud provide on-demand access to computing resources.",
        "Cybersecurity has become increasingly important in our digital world. Organizations must implement robust security measures to protect sensitive data from cyber threats.",
        "The Internet of Things connects billions of devices worldwide. Smart sensors collect data that can be analyzed to optimize processes and improve efficiency."
    ]
}

CODE_SNIPPETS = {
    'python': [
        {
            'code': '''def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)''',
            'description': 'Python algorithms'
        },
        {
            'code': '''class DataProcessor:
    def __init__(self, data):
        self.data = data
        self.processed = False
    
    def process(self):
        if not self.processed:
            self.data = [x * 2 for x in self.data if x > 0]
            self.processed = True
        return self.data
    
    def get_stats(self):
        return {
            'count': len(self.data),
            'sum': sum(self.data),
            'average': sum(self.data) / len(self.data) if self.data else 0
        }''',
            'description': 'Python class implementation'
        }
    ],
    'javascript': [
        {
            'code': '''const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
};''',
            'description': 'JavaScript utility functions'
        },
        {
            'code': '''class AsyncQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }
    
    async add(task) {
        this.queue.push(task);
        if (!this.processing) {
            await this.process();
        }
    }
    
    async process() {
        this.processing = true;
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            try {
                await task();
            } catch (error) {
                console.error('Task failed:', error);
            }
        }
        this.processing = false;
    }
}''',
            'description': 'JavaScript async queue'
        }
    ],
    'java': [
        {
            'code': '''import java.util.*;

public class Cache<K, V> {
    private Map<K, V> data;
    private int maxSize;
    
    public Cache(int maxSize) {
        this.data = new LinkedHashMap<>();
        this.maxSize = maxSize;
    }
    
    public V put(K key, V value) {
        if (data.size() >= maxSize) {
            Iterator<K> iterator = data.keySet().iterator();
            if (iterator.hasNext()) {
                data.remove(iterator.next());
            }
        }
        return data.put(key, value);
    }
    
    public V get(K key) {
        return data.get(key);
    }
    
    public boolean containsKey(K key) {
        return data.containsKey(key);
    }
    
    public int size() {
        return data.size();
    }
}''',
            'description': 'Java cache implementation'
        },
        {
            'code': '''import java.util.concurrent.*;

public class AsyncTaskProcessor {
    private ExecutorService executor;
    private Queue<Runnable> taskQueue;
    private boolean isProcessing;
    
    public AsyncTaskProcessor() {
        this.executor = Executors.newFixedThreadPool(4);
        this.taskQueue = new ConcurrentLinkedQueue<>();
        this.isProcessing = false;
    }
    
    public void addTask(Runnable task) {
        taskQueue.offer(task);
        if (!isProcessing) {
            processTasks();
        }
    }
    
    private void processTasks() {
        isProcessing = true;
        executor.submit(() -> {
            while (!taskQueue.isEmpty()) {
                Runnable task = taskQueue.poll();
                if (task != null) {
                    try {
                        task.run();
                    } catch (Exception e) {
                        System.err.println("Task failed: " + e.getMessage());
                    }
                }
            }
            isProcessing = false;
        });
    }
    
    public void shutdown() {
        executor.shutdown();
    }
}''',
            'description': 'Java async task processor'
        }
    ]
}

LANGUAGES = {
    'english': {
        'name': 'English',
        'texts': TEXT_COLLECTIONS
    }
}

@app.route('/')
def index():
    """Main page route"""
    return render_template('index.html')


@app.route('/api/text')
def get_text():
    """Get text based on various parameters"""
    try:
        content_type = request.args.get('type', 'text')
        language = request.args.get('language', 'english')
        category = request.args.get('category', 'tech')
        difficulty = request.args.get('difficulty', 'medium')
        random_mode = request.args.get('random', 'false').lower() == 'true'
        duration = int(request.args.get('duration', 30)) if request.args.get('duration') else 30  # Default to 30 seconds
    
        if content_type == 'code':
            lang = request.args.get('code_language', 'python')
            
            if random_mode:
                # Generate longer code for longer durations
                if duration >= 60:  # 1 minute or more
                    num_snippets = 3
                elif duration >= 30:  # 30 seconds
                    num_snippets = 2
                else:  # 15 seconds or less
                    num_snippets = 1
                
                code_snippets = []
                for _ in range(num_snippets):
                    code_snippets.append(ContentGenerator.generate_random_code_snippet(lang, difficulty))
                
                code = '\n\n'.join(code_snippets)
                return jsonify({
                    'text': code,
                    'type': 'code',
                    'language': lang,
                    'description': f'Random {lang} code',
                    'random': True
                })
            else:
                if lang in CODE_SNIPPETS:
                    # Select multiple snippets for longer durations
                    if duration >= 60:  # 1 minute or more
                        selected_snippets = random.sample(CODE_SNIPPETS[lang], min(3, len(CODE_SNIPPETS[lang])))
                    elif duration >= 30:  # 30 seconds
                        selected_snippets = random.sample(CODE_SNIPPETS[lang], min(2, len(CODE_SNIPPETS[lang])))
                    else:  # 15 seconds or less
                        selected_snippets = [random.choice(CODE_SNIPPETS[lang])]
                    
                    code = '\n\n'.join([snippet['code'] for snippet in selected_snippets])
                    return jsonify({
                        'text': code,
                        'type': 'code',
                        'language': lang,
                        'description': f'Multiple {lang} snippets',
                        'random': False
                    })
                else:
                    snippet = random.choice(CODE_SNIPPETS['python'])
                    return jsonify({
                        'text': snippet['code'],
                        'type': 'code',
                        'language': 'python',
                        'description': snippet['description'],
                        'random': False
                    })

        
        if random_mode:
            if category == 'tech':
                word_list = TECH_WORDS + COMMON_WORDS
            else:
                word_list = COMMON_WORDS
            
            # Generate longer text for longer durations to ensure users don't run out of words
            if duration >= 60:  # 1 minute or more
                num_paragraphs = 15  # Increased from 8 to 15 for ~100+ words
            elif duration >= 30:  # 30 seconds
                num_paragraphs = 5
            else:  # 15 seconds or less
                num_paragraphs = 3
            
            text = ContentGenerator.generate_random_paragraph(num_paragraphs, word_list)
            
            return jsonify({
                'text': text,
                'type': 'text',
                'language': language,
                'category': category,
                'random': True
            })
        
        # For non-random mode, combine multiple texts to ensure sufficient length
        if language in LANGUAGES and category in LANGUAGES[language]['texts']:
            texts = LANGUAGES[language]['texts'][category]
        else:
            texts = TEXT_COLLECTIONS[category]
        
        # Combine multiple texts for longer durations
        if duration >= 60:  # 1 minute or more
            selected_texts = random.sample(texts, min(5, len(texts)))  # Increased from 3 to 5
            text = ' '.join(selected_texts)
        elif duration >= 30:  # 30 seconds
            selected_texts = random.sample(texts, min(2, len(texts)))
            text = ' '.join(selected_texts)
        else:  # 15 seconds or less
            text = random.choice(texts)
        
        return jsonify({
            'text': text,
            'type': 'text',
            'language': language,
            'category': category,
            'random': False
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/random-words')
def get_random_words():
    """Generate random words for custom text creation"""
    try:
        count = int(request.args.get('count', 10))
        category = request.args.get('category', 'common')
        
        if category == 'tech':
            word_list = TECH_WORDS
        elif category == 'programming':
            word_list = PROGRAMMING_WORDS
        else:
            word_list = COMMON_WORDS
        
        words = random.choices(word_list, k=min(count, len(word_list)))
        return jsonify({'words': words})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/generate-sentence')
def generate_sentence():
    """Generate a single random sentence"""
    try:
        min_words = int(request.args.get('min_words', 5))
        max_words = int(request.args.get('max_words', 15))
        category = request.args.get('category', 'common')
        
        if category == 'tech':
            word_list = TECH_WORDS + COMMON_WORDS
        elif category == 'programming':
            word_list = PROGRAMMING_WORDS + COMMON_WORDS
        else:
            word_list = COMMON_WORDS
        
        sentence = ContentGenerator.generate_random_sentence(min_words, max_words, word_list)
        return jsonify({'sentence': sentence})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/generate-paragraph')
def generate_paragraph():
    """Generate a random paragraph"""
    try:
        num_sentences = int(request.args.get('sentences', 3))
        category = request.args.get('category', 'common')
        
        if category == 'tech':
            word_list = TECH_WORDS + COMMON_WORDS
        elif category == 'programming':
            word_list = PROGRAMMING_WORDS + COMMON_WORDS
        else:
            word_list = COMMON_WORDS
        
        paragraph = ContentGenerator.generate_random_paragraph(num_sentences, word_list)
        return jsonify({'paragraph': paragraph})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/categories')
def get_categories():
    """Get available categories for a language"""
    language = request.args.get('language', 'english')
    
    if language in LANGUAGES:
        categories = list(LANGUAGES[language]['texts'].keys())
    else:
        categories = list(TEXT_COLLECTIONS.keys())
    
    return jsonify({'categories': categories})


@app.route('/api/languages')
def get_languages():
    """Get available languages"""
    return jsonify({
        'languages': {code: data['name'] for code, data in LANGUAGES.items()}
    })


@app.route('/api/result', methods=['POST'])
def save_result():
    """Save typing test result with enhanced data"""
    data = request.json
    
    result = {
        'wpm': data.get('wpm', 0),
        'accuracy': data.get('accuracy', 0),
        'time_taken': data.get('time_taken', 0),
        'characters_typed': data.get('characters_typed', 0),
        'errors': data.get('errors', 0),
        'test_type': data.get('test_type', 'time'),
        'content_type': data.get('content_type', 'text'),
        'language': data.get('language', 'english'),
        'category': data.get('category', 'tech'),
        'timestamp': int(time.time())
    }
    
    return jsonify({
        'success': True,
        'result': result,
        'message': 'Result saved successfully'
    })


@app.route('/api/leaderboard')
def get_leaderboard():
    """Get leaderboard data (mock data for now)"""
    leaderboard = [
        {'rank': 1, 'name': 'SpeedDemon', 'wpm': 145, 'accuracy': 98, 'date': '2024-01-15'},
        {'rank': 2, 'name': 'TypeMaster', 'wpm': 138, 'accuracy': 99, 'date': '2024-01-14'},
        {'rank': 3, 'name': 'KeyboardWarrior', 'wpm': 132, 'accuracy': 97, 'date': '2024-01-13'},
        {'rank': 4, 'name': 'FastFingers', 'wpm': 128, 'accuracy': 96, 'date': '2024-01-12'},
        {'rank': 5, 'name': 'QuickType', 'wpm': 125, 'accuracy': 98, 'date': '2024-01-11'}
    ]
    
    return jsonify({'leaderboard': leaderboard})


# For Vercel deployment
app.debug = False

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')