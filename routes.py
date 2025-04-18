from flask import request, jsonify, send_file
from tasks import word_freq, sort_list, matrix_multiply,image_grayscale,factorial_distributed,fibonacci_distributed,prime_distributed
from utils.extract_text import extract_text_from_file

def register_routes(app):

    @app.route('/api/process', methods=['POST'])
    def handle_word_frequency():
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        try:
            text = extract_text_from_file(file)
        except Exception as e:
            return jsonify({'error': str(e)}), 400

        if not text.strip():
            return jsonify({'error': 'File is empty or unsupported'}), 400

        result = word_freq.process_text_with_workers(text)
        return jsonify({'wordCount': result})


    @app.route('/sort', methods=['POST'])
    def sort_numbers():
        data = request.get_json()
        numbers = data.get('numbers', [])

        if not numbers or not all(isinstance(n, (int, float)) for n in numbers):
            return jsonify({"error": "Invalid number list"}), 400

        result = sort_list.process_sorting(numbers)
        return jsonify(result)


    @app.route('/multiply', methods=['POST'])
    def multiply_matrices():
        data = request.get_json()
        matrix_a = data.get('matrixA')
        matrix_b = data.get('matrixB')

        if not matrix_a or not matrix_b:
            return jsonify({"error": "Missing matrices"}), 400

        try:
            result = matrix_multiply.multiply_distributed(matrix_a, matrix_b)
            return jsonify({"result": result})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @app.route('/convert', methods=['POST'])
    def convert_image():
        if 'image' not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        image = request.files['image']
        image.save('uploads/temp.png')  # Save temporarily

        try:
            result_path = image_grayscale.process_image('uploads/temp.png')
            return send_file(result_path, mimetype='image/png')
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @app.route('/calculate-factorial', methods=['POST'])
    def calculate_factorial():
        data = request.get_json()
        number = data.get('number')

        if number is None or not isinstance(number, int) or number < 0:
            return jsonify({"error": "Please provide a non-negative integer."}), 400

        try:
            result = factorial_distributed.process_factorial(number)
            return jsonify({"factorial": result})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @app.route('/generate-fibonacci', methods=['POST'])
    def generate_fibonacci():
        data = request.get_json()
        position = data.get('position')

        if not isinstance(position, int) or position < 1:
            return jsonify({'error': 'Invalid position'}), 400

        series = fibonacci_distributed.process_fibonacci(position)
        return jsonify({'series': series})
    
    @app.route('/check_prime', methods=['POST'])
    def check_prime():
        data = request.get_json()
        number = data.get('number')
        if number is None or not str(number).isdigit():
            return jsonify({'error': 'Invalid input'}), 400

        result = prime_distributed.process_prime_check(int(number))
        return jsonify({'result': result})

    @app.route('/generate_primes', methods=['POST'])
    def generate_primes():
        data = request.get_json()
        limit = data.get('limit')
        if limit is None or not str(limit).isdigit() or int(limit) < 2:
            return jsonify({'error': 'Invalid input'}), 400

        primes = prime_distributed.process_prime_generation(int(limit))
        return jsonify({'primes': primes})
