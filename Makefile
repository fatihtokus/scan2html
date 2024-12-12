.PHONY: clean build test

clean:
	rm -rf count

build:
	go build -o count .

test:
	go test -race -v ./...