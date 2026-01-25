#!/bin/bash
# mALIGNa Docker wrapper script
# Provides convenient shortcuts for common operations

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE_NAME="maligna:latest"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    exit 1
fi

# Build image if it doesn't exist
build_image() {
    if [[ "$(docker images -q $IMAGE_NAME 2> /dev/null)" == "" ]]; then
        echo "Building mALIGNa Docker image..."
        docker build -t $IMAGE_NAME "$SCRIPT_DIR"
    fi
}

# Show usage
show_usage() {
    echo "mALIGNa Docker Wrapper"
    echo ""
    echo "Usage: $0 <command> [options...]"
    echo ""
    echo "Commands:"
    echo "  build         Build the Docker image"
    echo "  help          Show mALIGNa help"
    echo "  run           Run maligna with arguments"
    echo "  shell         Start an interactive shell"
    echo "  example1      Run basic Viterbi alignment example"
    echo "  example2      Run Moore's algorithm example"
    echo "  example3      Run Oracle alignment example"
    echo "  align         Align two files (see below)"
    echo ""
    echo "Align command usage:"
    echo "  $0 align <source.txt> <target.txt> [output-dir]"
    echo ""
    echo "Examples:"
    echo "  $0 help"
    echo "  $0 run parse -h"
    echo "  $0 shell"
    echo "  $0 align myfile-en.txt myfile-de.txt ./output"
}

case "$1" in
    build)
        echo "Building mALIGNa Docker image..."
        docker build -t $IMAGE_NAME "$SCRIPT_DIR"
        ;;
    
    help)
        build_image
        docker run --rm $IMAGE_NAME maligna -h
        ;;
    
    run)
        build_image
        shift
        docker run --rm -i \
            -v "$PWD:/data" \
            -w /data \
            $IMAGE_NAME maligna "$@"
        ;;
    
    shell)
        build_image
        docker run --rm -it \
            -v "$PWD:/data" \
            -v "$SCRIPT_DIR/maligna-ui/examples:/examples:ro" \
            -w /data \
            $IMAGE_NAME bash
        ;;
    
    example1)
        build_image
        cd "$SCRIPT_DIR"
        docker compose run --rm example1
        ;;
    
    example2)
        build_image
        cd "$SCRIPT_DIR"
        docker compose run --rm example2-full
        ;;
    
    example3)
        build_image
        cd "$SCRIPT_DIR"
        docker compose run --rm example3
        ;;
    
    align)
        build_image
        if [[ -z "$2" || -z "$3" ]]; then
            echo "Error: Please provide source and target files"
            echo "Usage: $0 align <source.txt> <target.txt> [output-dir]"
            exit 1
        fi
        
        SOURCE_FILE="$2"
        TARGET_FILE="$3"
        OUTPUT_DIR="${4:-.}"
        
        # Get absolute paths
        SOURCE_ABS=$(realpath "$SOURCE_FILE")
        TARGET_ABS=$(realpath "$TARGET_FILE")
        OUTPUT_ABS=$(realpath "$OUTPUT_DIR")
        
        SOURCE_NAME=$(basename "$SOURCE_FILE" .txt)
        TARGET_NAME=$(basename "$TARGET_FILE" .txt)
        
        echo "Aligning: $SOURCE_FILE <-> $TARGET_FILE"
        echo "Output directory: $OUTPUT_DIR"
        
        docker run --rm \
            -v "$(dirname "$SOURCE_ABS"):/source:ro" \
            -v "$(dirname "$TARGET_ABS"):/target:ro" \
            -v "$OUTPUT_ABS:/output" \
            $IMAGE_NAME bash -c "
                maligna parse -c txt /source/$(basename "$SOURCE_FILE") /target/$(basename "$TARGET_FILE") |
                maligna modify -c split-sentence |
                maligna modify -c trim |
                maligna align -c viterbi -a poisson -n word -s iterative-band |
                maligna select -c one-to-one |
                maligna format -c txt /output/${SOURCE_NAME}-aligned.txt /output/${TARGET_NAME}-aligned.txt
            "
        
        echo "Done! Output files:"
        echo "  $OUTPUT_DIR/${SOURCE_NAME}-aligned.txt"
        echo "  $OUTPUT_DIR/${TARGET_NAME}-aligned.txt"
        ;;
    
    *)
        show_usage
        ;;
esac
